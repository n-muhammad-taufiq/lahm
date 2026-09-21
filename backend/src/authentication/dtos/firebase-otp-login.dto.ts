import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "../../users/enums/role.enum";

export class FirebaseOtpLoginDto {
    @IsString()
    @IsNotEmpty()
    idToken: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}
