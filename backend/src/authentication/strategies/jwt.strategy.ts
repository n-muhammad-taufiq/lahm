import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        });
    }

    async validate(payload: { sub: number; role: Role }) {
        const user = await this.usersService.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException('User not found or token invalid');
        }
        return user;
    }
}
