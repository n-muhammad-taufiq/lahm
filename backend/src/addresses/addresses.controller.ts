import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Customer } from '../customers/entities/customer.entity';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CUSTOMER)
export class AddressesController {
  constructor(
    private readonly addressesService: AddressesService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private async getCustomer(userId: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!customer) {
      throw new ForbiddenException(
        'Authenticated user is not registered as a customer',
      );
    }
    return customer;
  }

  @Post()
  async create(@Req() req: any, @Body() createAddressDto: CreateAddressDto) {
    const customer = await this.getCustomer(req.user.id);
    return this.addressesService.create(customer.id, createAddressDto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const customer = await this.getCustomer(req.user.id);
    return this.addressesService.findAllByCustomerId(customer.id);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const customer = await this.getCustomer(req.user.id);
    return this.addressesService.findById(id, customer.id);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const customer = await this.getCustomer(req.user.id);
    return this.addressesService.update(id, customer.id, updateAddressDto);
  }

  @Patch(':id/set-default')
  async setDefault(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const customer = await this.getCustomer(req.user.id);
    return this.addressesService.setDefault(id, customer.id);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    const customer = await this.getCustomer(req.user.id);
    await this.addressesService.remove(id, customer.id);
    return { success: true };
  }
}
