jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(() => []),
  cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from '../firebase/firebase.service';
import { DataSource } from 'typeorm';
import { Role } from '../users/enums/role.enum';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let firebaseService: jest.Mocked<FirebaseService>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$hashedpasswordstring',
    phoneNumber: '+919876543210',
    role: Role.CUSTOMER,
  };

  const mockDecodedToken = {
    phone_number: '+919876543210',
    uid: 'firebase-uid-123',
  } as any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockManager = {
      create: jest.fn().mockImplementation((entity, data) => ({ id: 1, ...data })),
      save: jest.fn().mockImplementation(async (entity, data) => ({ id: 1, ...data })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmailWithPassword: jest.fn(),
            findOneByPhone: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_REFRESH_TOKEN_SECRET') return 'refreshSecret';
              return null;
            }),
          },
        },
        {
          provide: FirebaseService,
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (callback) => callback(mockManager)),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    firebaseService = module.get(FirebaseService);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('emailLogin', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findOneByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.emailLogin({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      usersService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.emailLogin({ email: 'test@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user without password and tokens on successful login', async () => {
      usersService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('mockAccessToken')
        .mockResolvedValueOnce('mockRefreshToken');

      const result = await service.emailLogin({
        email: 'test@example.com',
        password: 'correctpassword',
      });

      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBe('mockAccessToken');
      expect(result.refreshToken).toBe('mockRefreshToken');
    });
  });

  describe('firebaseOtpLogin', () => {
    it('should return isNewUser: true if user is not found in database', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(null);

      const result = await service.firebaseOtpLogin({
        idToken: 'valid-firebase-id-token',
        role: Role.CUSTOMER,
      });

      expect(result.isNewUser).toBe(true);
      expect((result as any).phoneNumber).toBe('+919876543210');
    });

    it('should throw UnauthorizedException if user role does not match requested role', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(mockUser); // Role.CUSTOMER

      await expect(
        service.firebaseOtpLogin({
          idToken: 'valid-firebase-id-token',
          role: Role.MERCHANT,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should log in user and return tokens when user exists and role matches', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(mockUser);
      jwtService.signAsync
        .mockResolvedValueOnce('mockAccessToken')
        .mockResolvedValueOnce('mockRefreshToken');

      const result = await service.firebaseOtpLogin({
        idToken: 'valid-firebase-id-token',
        role: Role.CUSTOMER,
      });

      expect(result.isNewUser).toBe(false);
      if (!result.isNewUser) {
        expect(result.user.phoneNumber).toBe('+919876543210');
        expect(result.accessToken).toBe('mockAccessToken');
        expect(result.refreshToken).toBe('mockRefreshToken');
      }
    });
  });

  describe('firebaseOtpRegister', () => {
    it('should throw ConflictException if user already exists with that phone number', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(mockUser);

      await expect(
        service.firebaseOtpRegister({
          idToken: 'valid-id-token',
          role: Role.CUSTOMER,
          name: 'New User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if user already exists with that email', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(null);
      usersService.findOneByEmail.mockResolvedValue(mockUser);

      await expect(
        service.firebaseOtpRegister({
          idToken: 'valid-id-token',
          role: Role.CUSTOMER,
          name: 'New User',
          email: 'test@example.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and corresponding role entity in transaction', async () => {
      firebaseService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      usersService.findOneByPhone.mockResolvedValue(null);
      usersService.findOneByEmail.mockResolvedValue(null);
      jwtService.signAsync
        .mockResolvedValueOnce('mockAccessToken')
        .mockResolvedValueOnce('mockRefreshToken');

      const result = await service.firebaseOtpRegister({
        idToken: 'valid-id-token',
        role: Role.MERCHANT,
        name: 'New Merchant',
        email: 'merchant@example.com',
      });

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.user.name).toBe('New Merchant');
      expect(result.accessToken).toBe('mockAccessToken');
    });
  });
});
