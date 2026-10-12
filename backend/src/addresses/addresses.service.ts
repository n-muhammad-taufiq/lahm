import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { MAX_ADDRESSES_PER_CUSTOMER } from './constants/address.constants';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Stage 1-4 Full-Stack Lifecycle: Create Address
   * - Trigger: Authenticated customer submits address payload
   * - In-flight: Customer existence check, 20-address ceiling check, auto-promotion of first address, atomic default swap
   * - Success: DB commit within transaction, returned Address entity
   * - Failure: Transaction rollback on failure, clear descriptive HTTP exception
   */
  async create(customerId: number, dto: CreateAddressDto): Promise<Address> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const count = await this.addressRepository.count({
      where: { customerId },
    });
    if (count >= MAX_ADDRESSES_PER_CUSTOMER) {
      throw new BadRequestException(
        `Customer cannot have more than ${MAX_ADDRESSES_PER_CUSTOMER} saved addresses`,
      );
    }

    // Business rule: If first address for customer, auto-promote to default.
    // Otherwise, honor client request (defaulting to false).
    const isDefault = count === 0 ? true : (dto.isDefault ?? false);

    return await this.dataSource.transaction(async (manager) => {
      if (isDefault) {
        await manager.update(
          Address,
          { customerId, isDefault: true },
          { isDefault: false },
        );
      }

      const address = manager.create(Address, {
        ...dto,
        customerId,
        isDefault,
      });

      return await manager.save(Address, address);
    });
  }

  /**
   * Stage 1-4 Full-Stack Lifecycle: Find All Customer Addresses
   * - Trigger: Authenticated customer retrieves their saved address book
   * - In-flight: Queries DB scoped strictly by customerId
   * - Success: Returns array of Address entities ordered with default first, then newest
   * - Failure: Empty array if customer has no saved addresses
   */
  async findAllByCustomerId(customerId: number): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { customerId },
      order: {
        isDefault: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Stage 1-4 Full-Stack Lifecycle: Find Address By ID
   * - Trigger: Authenticated customer requests a specific address by ID
   * - In-flight: Queries DB matching both address ID and customer ID for strict tenant isolation
   * - Success: Returns matching Address entity
   * - Failure: Throws NotFoundException if address does not exist or belongs to another customer
   */
  async findById(id: number, customerId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, customerId },
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  /**
   * Stage 1-4 Full-Stack Lifecycle: Update Address
   * - Trigger: Authenticated customer updates saved address fields or default status
   * - In-flight: Verifies ownership, prevents unsetting active default without a replacement, atomic default swap
   * - Success: DB commit within transaction, returned updated Address entity
   * - Failure: Rollback on DB error, 404 if not found, 400 if illegal default unset
   */
  async update(
    id: number,
    customerId: number,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.findById(id, customerId);

    if (dto.isDefault === false && address.isDefault) {
      throw new BadRequestException(
        'Cannot unset default address. Set another address as default instead.',
      );
    }

    return await this.dataSource.transaction(async (manager) => {
      if (dto.isDefault === true && !address.isDefault) {
        await manager.update(
          Address,
          { customerId, isDefault: true },
          { isDefault: false },
        );
      }

      Object.assign(address, dto);
      return await manager.save(Address, address);
    });
  }

  /**
   * Stage 1-4 Full-Stack Lifecycle: Set Default Address
   * - Trigger: Authenticated customer taps "Set as Default" on a saved address
   * - In-flight: Verifies ownership via findById; fast-returns if already default; atomic default swap inside transaction
   * - Success: DB commit within transaction, returned updated Address entity
   * - Failure: Rollback on DB error, 404 if not found or unauthorized
   */
  async setDefault(id: number, customerId: number): Promise<Address> {
    const address = await this.findById(id, customerId);

    if (address.isDefault) {
      return address;
    }

    return await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Address,
        { customerId, isDefault: true },
        { isDefault: false },
      );

      address.isDefault = true;
      return await manager.save(Address, address);
    });
  }

  /**
   * Stage 1-4 Full-Stack Lifecycle: Remove Address
   * - Trigger: Authenticated customer deletes a saved address
   * - In-flight: Verifies ownership via findById; deletes address within transaction; if deleted address was default, auto-promotes newest remaining address to default
   * - Success: DB commit within transaction, void return
   * - Failure: Rollback on DB error, 404 if not found or unauthorized
   */
  async remove(id: number, customerId: number): Promise<void> {
    const address = await this.findById(id, customerId);

    await this.dataSource.transaction(async (manager) => {
      await manager.remove(Address, address);

      // If deleted address was default, promote newest remaining address to default
      if (address.isDefault) {
        const remaining = await manager.findOne(Address, {
          where: { customerId },
          order: { createdAt: 'DESC' },
        });

        if (remaining) {
          remaining.isDefault = true;
          await manager.save(Address, remaining);
        }
      }
    });
  }
}





