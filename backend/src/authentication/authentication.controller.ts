import { Body, Controller, HttpCode, HttpStatus, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { EmailLoginDto } from './dtos/email-login-dto.dto';
import { FirebaseOtpLoginDto } from './dtos/firebase-otp-login.dto';
import { FirebaseOtpRegisterDto } from './dtos/firebase-otp-register.dto';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService) {}

    @HttpCode(HttpStatus.OK)
    @Post('email-login')
    async emailLogin(
        @Body() emailLoginDto: EmailLoginDto,
    ): Promise<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }> {
        return await this.authenticationService.emailLogin(emailLoginDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('firebase-otp-login')
    async firebaseOtpLogin(@Body() firebaseOtpLoginDto: FirebaseOtpLoginDto) {
        return await this.authenticationService.firebaseOtpLogin(firebaseOtpLoginDto);
    }

    @Post('firebase-otp-register')
    async firebaseOtpRegister(@Body() firebaseOtpRegisterDto: FirebaseOtpRegisterDto) {
        return await this.authenticationService.firebaseOtpRegister(firebaseOtpRegisterDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}