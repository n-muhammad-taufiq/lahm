import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { FirebaseModule } from "../firebase/firebase.module";

@Module({
    imports: [
        UsersModule,
        ConfigModule,
        FirebaseModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: {
                    expiresIn: '15m',
                },
            }),
        }),
    ],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        JwtStrategy,
        JwtAuthGuard,
    ],
    exports: [
        AuthenticationService,
        PassportModule,
        JwtModule,
        JwtAuthGuard,
    ],
})
export class AuthenticationModule { }