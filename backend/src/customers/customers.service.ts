import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { User } from "src/users/entities/user.entity";
import { RegisterCustomerDto } from "./dtos/register-customer-dto.dto";
import * as bcrypt from 'bcrypt';
import { Role } from "src/users/enums/role.enum";
import { UsersService } from "src/users/users.service";

@Injectable()
export class CustomersService {

    constructor(
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource
    ) {}

    async register(registerCustomerDto: RegisterCustomerDto) {
        const { name, email, password, phoneNumber } = registerCustomerDto;
        const existingUser = await this.usersService.findOne(email, phoneNumber);

        if (existingUser) {
            throw new ConflictException('User with this email or phone number already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const {savedUser, savedCustomer}= await this.dataSource.transaction(async (manager)=>{
            const savedUser = await manager.save(User, {name, email, phoneNumber, password: hashedPassword, role: Role.CUSTOMER});
            const savedCustomer = await manager.save(Customer, {user: savedUser});

            return {savedUser, savedCustomer};
        })

        const {password: savedPassword, ...userWithoutPassword} = savedUser;

        return {user: userWithoutPassword, customer: savedCustomer};
    }
}