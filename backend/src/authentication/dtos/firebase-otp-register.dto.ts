import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../../users/enums/role.enum";

export class FirebaseOtpRegisterDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}
