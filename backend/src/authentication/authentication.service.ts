import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { EmailLoginDto } from "./dtos/email-login-dto.dto";
import { FirebaseOtpLoginDto } from "./dtos/firebase-otp-login.dto";
import { FirebaseOtpRegisterDto } from "./dtos/firebase-otp-register.dto";
import { RefreshTokenDto } from "./dtos/refresh-token.dto";
import { UsersService } from "../users/users.service";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { FirebaseService } from "../firebase/firebase.service";
import { DataSource } from "typeorm";
import { Role } from "../users/enums/role.enum";
import { Customer } from "../customers/entities/customer.entity";
import { Merchant } from "../merchants/entities/merchant.entity";
import { DeliveryPartner } from "../delivery-partners/entities/delivery-partner.entity";

@Injectable()
export class AuthenticationService {

    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly firebaseService: FirebaseService,
        private readonly dataSource: DataSource,
    ) {}

    async emailLogin(emailLoginDto: EmailLoginDto): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
        const { email, password } = emailLoginDto;

        const matchedUser = await this.usersService.findOneByEmailWithPassword(email);

        if (!matchedUser) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const hashedPassword = matchedUser.password;
        if (!hashedPassword) {
            throw new UnauthorizedException('Password login not enabled for this account');
        }

        const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Invalid Credentials');
        }

        const { accessToken, refreshToken } = await this.generateTokens(matchedUser);
        const { password: matchedUserPassword, ...userWithoutPassword } = matchedUser;

        return { user: userWithoutPassword, accessToken, refreshToken };
    }

    async firebaseOtpLogin(dto: FirebaseOtpLoginDto): Promise<
        | { isNewUser: true; phoneNumber: string; message: string }
        | { isNewUser: false; user: Omit<User, 'password'>; accessToken: string; refreshToken: string }
    > {
        const decodedToken = await this.firebaseService.verifyIdToken(dto.idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            throw new UnauthorizedException('Phone number not found in Firebase token');
        }

        const matchedUser = await this.usersService.findOneByPhone(phoneNumber);

        if (!matchedUser) {
            return {
                isNewUser: true,
                phoneNumber,
                message: 'User not registered. Please complete registration.',
            };
        }

        if (matchedUser.role !== dto.role) {
            throw new UnauthorizedException(`Account registered with a different role (${matchedUser.role})`);
        }

        const { accessToken, refreshToken } = await this.generateTokens(matchedUser);
        const { password, ...userWithoutPassword } = matchedUser;

        return {
            isNewUser: false,
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    async firebaseOtpRegister(dto: FirebaseOtpRegisterDto): Promise<{
        user: Omit<User, 'password'>;
        accessToken: string;
        refreshToken: string;
    }> {
        const decodedToken = await this.firebaseService.verifyIdToken(dto.idToken);
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            throw new UnauthorizedException('Phone number not found in Firebase token');
        }

        const existingPhoneUser = await this.usersService.findOneByPhone(phoneNumber);
        if (existingPhoneUser) {
            throw new ConflictException('User with this phone number already exists');
        }

        if (dto.email) {
            const existingEmailUser = await this.usersService.findOneByEmail(dto.email);
            if (existingEmailUser) {
                throw new ConflictException('User with this email already exists');
            }
        }

        const { savedUser } = await this.dataSource.transaction(async (manager) => {
            const userToCreate = manager.create(User, {
                name: dto.name,
                phoneNumber,
                role: dto.role,
                ...(dto.email ? { email: dto.email } : {}),
            });
            const savedUser = await manager.save(User, userToCreate);

            switch (dto.role) {
                case Role.CUSTOMER:
                    await manager.save(Customer, { user: savedUser });
                    break;
                case Role.MERCHANT:
                    await manager.save(Merchant, { user: savedUser });
                    break;
                case Role.DELIVERY_PARTNER:
                    await manager.save(DeliveryPartner, { user: savedUser });
                    break;
            }

            return { savedUser };
        });

        const { accessToken, refreshToken } = await this.generateTokens(savedUser);
        const { password, ...userWithoutPassword } = savedUser;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    }

    async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = {
            sub: user.id,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: '7d',
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET');

        let payload: { sub: number; role: Role };
        try {
            payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: refreshSecret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        return this.generateTokens(user);
    }
}