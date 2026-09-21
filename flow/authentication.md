# Authentication Implementation & Flow Guide

This document describes the complete authentication architecture implemented in **Project Lahm**, including the step-by-step runtime flows for each authentication method and a file-by-file breakdown explaining the exact responsibility of every file.

---

## 1. Overview of Authentication Methods

Project Lahm supports two authentication methods across all user roles (`Customer`, `Merchant`, `DeliveryPartner`):

1. **Firebase Phone OTP Authentication**:
   - **Login**: Verifies an existing user via phone number and validates their role for the specific app.
   - **Registration**: Registers a new user with a verified phone number, creating both the base `User` record and the role-specific profile entity (`Customer`, `Merchant`, or `DeliveryPartner`) in a single database transaction.
2. **Email & Password Authentication**:
   - Traditional credential-based login using hashed passwords (`bcrypt`).
3. **JWT Session Management (Passport JWT)**:
   - Stateless authentication using short-lived Access Tokens (`15m`) and long-lived Refresh Tokens (`7d`).
   - Protected routes guarded with `@UseGuards(JwtAuthGuard)`.

---

## 2. Step-by-Step Authentication Flows

### Flow 1: Phone OTP Login (Existing Users)

1. **Initiating Verification**: The user enters their phone number in the mobile application (e.g., Customer App) and clicks "Send OTP".
2. **SMS Dispatch**: The frontend calls the Firebase Client SDK (`signInWithPhoneNumber`). Google's telecom infrastructure dispatches a 6-digit verification code directly to the user's phone via SMS.
3. **Entering Code**: The user types the 6-digit code into the mobile app.
4. **Firebase Confirmation**: The frontend confirms the code using Firebase Client SDK (`confirmation.confirm(code)`). Upon successful verification, Firebase generates a cryptographically signed **Firebase ID Token**.
5. **API Request**: The frontend calls the backend endpoint:
   `POST /auth/firebase-otp-login` with payload `{ idToken, role: "customer" }`.
6. **Token Verification**: The backend receives the `idToken` and passes it to `FirebaseService.verifyIdToken()`. Firebase Admin SDK validates the signature, expiration, and audience against Google's public keys.
7. **Phone Extraction**: The backend extracts the verified phone number (in international E.164 format, e.g., `+919876543210`) from the decoded token claims.
8. **User & Role Lookup**:
   - The backend checks if a user exists with this phone number via `usersService.findOneByPhone()`.
   - **If user does not exist**: The backend returns `{ isNewUser: true, phoneNumber, message: "User not registered. Please complete registration." }`. The frontend redirects the user to the registration screen.
   - **If user exists but role does not match** (e.g., a Customer trying to log into the Merchant app): The backend throws an `UnauthorizedException` (`401 Unauthorized: Account registered with a different role`).
   - **If user exists and role matches**: The backend generates application JWT tokens (`accessToken` and `refreshToken`) via `jwtService.signAsync()`.
9. **Response**: The backend returns `{ isNewUser: false, user, accessToken, refreshToken }`. The frontend stores the tokens securely and navigates to the home screen.

---

### Flow 2: Phone OTP Registration (New Users)

1. **Triggering Registration**: When the login flow detects `isNewUser: true`, the frontend prompts the user to enter their profile details (name and optional email).
2. **API Request**: The frontend calls the backend endpoint:
   `POST /auth/firebase-otp-register` with payload `{ idToken, role, name, email? }`.
3. **Token Verification**: The backend verifies the `idToken` using `FirebaseService.verifyIdToken()` and retrieves the verified phone number.
4. **Duplicate Prevention**: The backend checks that no user already exists with this phone number or email. If a duplicate exists, it throws a `ConflictException` (`409 Conflict`).
5. **Database Transaction**: Inside an atomic database transaction (`dataSource.transaction`):
   - A new `User` record is created with `{ name, phoneNumber, role, email? }`.
   - Based on the provided `role`, the corresponding role profile entity is automatically created and linked to the user:
     - `Role.CUSTOMER` creates a new `Customer` entity linked to `User`.
     - `Role.MERCHANT` creates a new `Merchant` entity linked to `User`.
     - `Role.DELIVERY_PARTNER` creates a new `DeliveryPartner` entity linked to `User`.
6. **Token Generation**: The backend generates application JWT tokens (`accessToken` and `refreshToken`) containing `sub: user.id` and `role: user.role`.
7. **Response**: The backend returns the newly created user object (without password), along with the `accessToken` and `refreshToken`.

---

### Flow 3: Email & Password Login

1. **API Request**: The user enters their email and password in the app. The frontend calls:
   `POST /auth/email-login` with payload `{ email, password }`.
2. **User Lookup with Password**: The backend queries the database using `usersService.findOneByEmailWithPassword(email)`. Because the `password` column is configured with `{ select: false }` on the `User` entity, this method explicitly requests `user.password` via TypeORM QueryBuilder.
3. **Credentials Check**:
   - If no user matches the email: Throws `UnauthorizedException('Invalid Credentials')`.
   - If the account has no password set (e.g., registered via phone OTP alone): Throws `UnauthorizedException('Password login not enabled for this account')`.
   - Compares the plain-text password with the stored hash using `bcrypt.compare(password, hashedPassword)`. If mismatched: Throws `UnauthorizedException('Invalid Credentials')`.
4. **Token Generation**: The backend generates `accessToken` and `refreshToken`.
5. **Response**: The backend returns `{ user: userWithoutPassword, accessToken, refreshToken }`.

---

### Flow 4: Protected API Requests & Guard Validation

1. **Header Attachment**: For any protected endpoint (e.g., `GET /auth/me`), the client includes the JWT access token in the request header:
   `Authorization: Bearer <accessToken>`.
2. **Guard Interception**: The route is decorated with `@UseGuards(JwtAuthGuard)`. NestJS routes the request to `JwtAuthGuard`.
3. **Passport Strategy Execution**: `JwtStrategy` automatically extracts the token from the header using `ExtractJwt.fromAuthHeaderAsBearerToken()`.
4. **Signature Verification**: Passport validates the token against `JWT_ACCESS_TOKEN_SECRET` and checks expiration.
5. **User Attachment**: `JwtStrategy.validate(payload)` queries `usersService.findById(payload.sub)`. If the user exists, Passport attaches the user entity to the request object (`req.user`).
6. **Controller Execution**: The controller handler executes, accessing the authenticated user via `req.user`.

---

## 3. Detailed File-by-File Breakdown

### Backend Files (`backend/src/`)

#### 1. `users/entities/user.entity.ts`
- **Purpose**: Defines the central `User` database table for PostgreSQL using TypeORM.
- **Fields**:
  - `id`: Auto-incrementing primary key.
  - `name`: User's full name.
  - `email`: Optional unique email (`nullable: true` to support phone-number-first accounts).
  - `password`: Optional hashed password (`select: false, nullable: true` so password is excluded from queries by default and not required for OTP users).
  - `phoneNumber`: Unique phone number stored in E.164 international format.
  - `role`: Role enum (`customer`, `merchant`, `delivery_partner`).

#### 2. `users/users.service.ts`
- **Purpose**: Provides data access methods for querying users from the database.
- **Key Methods**:
  - `findOneByPhone(phoneNumber)`: Finds a user by their phone number.
  - `findOneByEmail(email)`: Finds a user by email (without password).
  - `findOneByEmailWithPassword(email)`: Uses TypeORM QueryBuilder with `.addSelect("user.password")` to retrieve the password hash exclusively during credential checks.
  - `findById(id)`: Looks up a user by primary ID (used by Passport JWT strategy).
  - `findOne(email, phoneNumber)`: Checks whether either email or phone number is already registered.

#### 3. `users/enums/role.enum.ts`
- **Purpose**: Defines the `Role` enum values: `CUSTOMER = 'customer'`, `DELIVERY_PARTNER = 'delivery_partner'`, `MERCHANT = 'merchant'`.

#### 4. `firebase/firebase.service.ts`
- **Purpose**: Encapsulates the Google Firebase Admin SDK connection and operations.
- **Responsibilities**:
  - Initializes the Firebase Admin app singleton using credentials from environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
  - Converts escaped `\n` characters in the private key to valid PEM format.
  - Exposes `verifyIdToken(idToken: string)`: Calls Firebase Admin Auth to verify token integrity, validity, and expiration. Returns decoded claims including `phone_number` and `uid`.

#### 5. `firebase/firebase.module.ts`
- **Purpose**: A NestJS module that imports `ConfigModule`, registers `FirebaseService` as a provider, and exports it so other modules can inject it.

#### 6. `authentication/authentication.controller.ts`
- **Purpose**: HTTP route controller exposing the authentication endpoints to clients.
- **Endpoints**:
  - `POST /auth/firebase-otp-login`: Endpoint for phone OTP login.
  - `POST /auth/firebase-otp-register`: Endpoint for phone OTP registration.
  - `POST /auth/email-login`: Endpoint for email/password login.
  - `GET /auth/me`: Protected endpoint guarded by `@UseGuards(JwtAuthGuard)` returning the active user's profile.

#### 7. `authentication/authentication.service.ts`
- **Purpose**: Contains the core business logic for authentication.
- **Responsibilities**:
  - `firebaseOtpLogin(dto)`: Verifies Firebase ID token, looks up user by phone, checks role match, and generates JWT tokens.
  - `firebaseOtpRegister(dto)`: Verifies Firebase ID token, checks for duplicates, executes database transaction to save `User` and role profile entity, and generates JWT tokens.
  - `emailLogin(dto)`: Validates email and compares password hashes with `bcrypt`.
  - `generateTokens(user)`: Signs JWT access token (15m expiration) and refresh token (7d expiration).

#### 8. `authentication/authentication.module.ts`
- **Purpose**: Central NestJS module for authentication.
- **Responsibilities**:
  - Imports `UsersModule`, `ConfigModule`, `FirebaseModule`, and `PassportModule.register({ defaultStrategy: 'jwt' })`.
  - Registers `JwtModule.registerAsync()` with `JWT_ACCESS_TOKEN_SECRET` and sign options.
  - Registers and exports `AuthenticationService`, `JwtStrategy`, and `JwtAuthGuard`.

#### 9. `authentication/strategies/jwt.strategy.ts`
- **Purpose**: Passport JWT strategy implementation.
- **Responsibilities**:
  - Extracts the Bearer token from the `Authorization` header.
  - Validates token against `JWT_ACCESS_TOKEN_SECRET`.
  - Implements `validate(payload)`: Queries `usersService.findById(payload.sub)` and attaches the user to `req.user`.

#### 10. `authentication/guards/jwt-auth.guard.ts`
- **Purpose**: NestJS route guard extending Passport's `AuthGuard('jwt')`.
- **Responsibilities**: Used with `@UseGuards(JwtAuthGuard)` on routes or controllers to require a valid Bearer JWT.

#### 11. `authentication/dtos/firebase-otp-login.dto.ts`
- **Purpose**: Request validation DTO for phone OTP login.
- **Fields**: `idToken: string`, `role: Role`.

#### 12. `authentication/dtos/firebase-otp-register.dto.ts`
- **Purpose**: Request validation DTO for phone OTP registration.
- **Fields**: `idToken: string`, `role: Role`, `name: string`, `email?: string`.

#### 13. `authentication/dtos/email-login-dto.dto.ts`
- **Purpose**: Request validation DTO for email login.
- **Fields**: `email: string`, `password: string`.

#### 14. Role Profile Entities
- `customers/entities/customer.entity.ts`: One-to-one relationship entity linked to `User`.
- `merchants/entities/merchant.entity.ts`: One-to-one relationship entity linked to `User`.
- `delivery-partners/entities/delivery-partner.entity.ts`: One-to-one relationship entity linked to `User`.

---

### Frontend Files (`frontend/apps/customer/src/`)

#### 1. `services/firebase/firebase.config.ts`
- **Purpose**: Initializes the client-side Firebase application.
- **Responsibilities**: Reads client environment variables (`EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, etc.) and exports `getClientAuth()` to provide the Firebase Client Auth instance.

#### 2. `services/firebase/firebasePhoneAuth.service.ts`
- **Purpose**: Manages phone OTP sending and verification on the client device.
- **Key Methods**:
  - `sendOtp(phoneNumber, appVerifier)`: Calls Firebase Client SDK `signInWithPhoneNumber()` to trigger SMS dispatch. Includes development fallback simulation when running in offline/testing mode.
  - `confirmOtp(otpCode)`: Confirms the 6-digit code with Firebase and extracts the client `idToken`.
  - `clearSession()`: Resets active confirmation state.

#### 3. `services/auth/authApiService.ts`
- **Purpose**: Axios HTTP API client for authentication endpoints.
- **Key Methods**:
  - `firebaseOtpLogin(data)`: Sends `POST /auth/firebase-otp-login`.
  - `firebaseOtpRegister(data)`: Sends `POST /auth/firebase-otp-register`.
  - `emailLogin(data)`: Sends `POST /auth/email-login`.
  - `getProfile()`: Sends `GET /auth/me`.
