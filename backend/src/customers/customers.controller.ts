import { Body, Controller, Post } from "@nestjs/common";
import { RegisterCustomerDto } from "./dtos/register-customer-dto.dto";
import { CustomersService } from "./customers.service";

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService){}

    @Post('register')
    async register(@Body() registerCustomerDto: RegisterCustomerDto) {
        return await this.customersService.register(registerCustomerDto);
    }
}