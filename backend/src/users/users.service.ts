import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { RegisterCustomerDto } from "src/customers/dtos/register-customer-dto.dto";
import { RegisterUserDto } from "./dtos/register-user-dto.dto";

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) { }

    async findOne(email: string, phoneNumber: string) {

        const matched = await this.userRepository.findOne({ where: [{ email }, { phoneNumber }] });
        return matched;
        
    }

    async findOneByEmail(email: string) : Promise<User | null>{
        const matchedUser = await this.userRepository.findOneBy({email});

        return matchedUser;
    }

    async findOneByEmailWithPassword(email: string): Promise<User | null> {
        return await this.userRepository
            .createQueryBuilder("user")
            .where("user.email = :email", { email })
            .addSelect("user.password")
            .getOne();
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOneBy({ id });
    }

    async findOneByPhone(phoneNumber: string): Promise<User | null>{
        const matchedUser = await this.userRepository.findOneBy({phoneNumber});

        return matchedUser;
    }

    /*async register(registerUserDto: RegisterUserDto) {
        const newCustomer = this.userRepository.create(registerUserDto);
        return await this.userRepository.save(registerUserDto);
    }*/
}