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

import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { EmailLoginDto } from './dtos/email-login-dto.dto';
import { FirebaseOtpLoginDto } from './dtos/firebase-otp-login.dto';
import { FirebaseOtpRegisterDto } from './dtos/firebase-otp-register.dto';
import { Role } from '../users/enums/role.enum';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            emailLogin: jest.fn(),
            firebaseOtpLogin: jest.fn(),
            firebaseOtpRegister: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get(AuthenticationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('emailLogin', () => {
    it('should call authenticationService.emailLogin and return result', async () => {
      const dto: EmailLoginDto = { email: 'user@example.com', password: 'password' };
      const expectedResponse = {
        user: { id: 1, name: 'User', email: 'user@example.com', phoneNumber: '123', role: Role.CUSTOMER },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      authService.emailLogin.mockResolvedValue(expectedResponse);

      const result = await controller.emailLogin(dto);

      expect(authService.emailLogin).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('firebaseOtpLogin', () => {
    it('should call authenticationService.firebaseOtpLogin and return result', async () => {
      const dto: FirebaseOtpLoginDto = { idToken: 'token-123', role: Role.CUSTOMER };
      const expectedResponse = {
        isNewUser: false as const,
        user: { id: 1, name: 'User', phoneNumber: '+919876543210', role: Role.CUSTOMER },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      authService.firebaseOtpLogin.mockResolvedValue(expectedResponse);

      const result = await controller.firebaseOtpLogin(dto);

      expect(authService.firebaseOtpLogin).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('firebaseOtpRegister', () => {
    it('should call authenticationService.firebaseOtpRegister and return result', async () => {
      const dto: FirebaseOtpRegisterDto = {
        idToken: 'token-123',
        role: Role.MERCHANT,
        name: 'Merchant User',
      };
      const expectedResponse = {
        user: { id: 2, name: 'Merchant User', phoneNumber: '+919876543210', role: Role.MERCHANT },
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      authService.firebaseOtpRegister.mockResolvedValue(expectedResponse);

      const result = await controller.firebaseOtpRegister(dto);

      expect(authService.firebaseOtpRegister).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });
});
