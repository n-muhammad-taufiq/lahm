import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AddressesService } from './addresses.service';
import { Address } from './entities/address.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { MAX_ADDRESSES_PER_CUSTOMER } from './constants/address.constants';

describe('AddressesService', () => {
  let service: AddressesService;
  let addressRepository: jest.Mocked<Repository<Address>>;
  let customerRepository: jest.Mocked<Repository<Customer>>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: {
    update: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    remove: jest.Mock;
  };

  const mockCustomer: Customer = {
    id: 1,
    user: { id: 10, email: 'customer@lahm.com' } as any,
    addresses: [],
    orders: [],
  } as Customer;

  const createSampleAddress = (override: Partial<Address> = {}): Address => ({
    id: 101,
    customerId: 1,
    label: 'Home',
    streetAddress: 'Flat 402, Al-Razi Heights, Block 5',
    landmark: 'Near Bilawal Chowrangi',
    city: 'Karachi',
    latitude: 24.8138,
    longitude: 67.0299,
    isDefault: false,
    createdAt: new Date('2026-03-01T10:00:00Z'),
    updatedAt: new Date('2026-03-01T10:00:00Z'),
    customer: mockCustomer,
    ...override,
  });

  const validCreateDto: CreateAddressDto = {
    label: 'Home',
    streetAddress: 'Flat 402, Al-Razi Heights, Block 5',
    landmark: 'Near Bilawal Chowrangi',
    city: 'Karachi',
    latitude: 24.8138,
    longitude: 67.0299,
    isDefault: false,
  };

  beforeEach(async () => {
    mockEntityManager = {
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      create: jest.fn().mockImplementation((entityClass, plainObj) => plainObj),
      save: jest.fn().mockImplementation(async (entityClass, entity) => ({
        ...entity,
        id: entity.id ?? 101,
      })),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        {
          provide: getRepositoryToken(Address),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb(mockEntityManager)),
          },
        },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    addressRepository = module.get(getRepositoryToken(Address));
    customerRepository = module.get(getRepositoryToken(Customer));
    dataSource = module.get<DataSource>(DataSource) as jest.Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should instantiate directly via constructor', () => {
    const directService = new AddressesService(
      addressRepository,
      customerRepository,
      dataSource,
    );
    expect(directService).toBeDefined();
  });

  // =========================================================================
  // create
  // =========================================================================
  describe('create', () => {
    it('should throw NotFoundException if customer does not exist in DB', async () => {
      customerRepository.findOne.mockResolvedValue(null);

      await expect(service.create(999, validCreateDto)).rejects.toThrow(
        new NotFoundException('Customer not found'),
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(addressRepository.count).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when address count reaches MAX_ADDRESSES_PER_CUSTOMER ceiling (20)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(MAX_ADDRESSES_PER_CUSTOMER);

      await expect(service.create(1, validCreateDto)).rejects.toThrow(
        new BadRequestException(
          `Customer cannot have more than ${MAX_ADDRESSES_PER_CUSTOMER} saved addresses`,
        ),
      );
      expect(addressRepository.count).toHaveBeenCalledWith({
        where: { customerId: 1 },
      });
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when address count exceeds MAX_ADDRESSES_PER_CUSTOMER ceiling (e.g., 25)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(25);

      await expect(service.create(1, validCreateDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should allow creation when customer has 19 addresses (ceiling - 1 boundary)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(19);

      const result = await service.create(1, { ...validCreateDto, isDefault: false });

      expect(result).toBeDefined();
      expect(result.customerId).toBe(1);
      expect(result.isDefault).toBe(false);
      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should auto-promote first address to default (count === 0) even if dto specifies isDefault: false', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(0);

      const result = await service.create(1, { ...validCreateDto, isDefault: false });

      expect(result.isDefault).toBe(true);
      // Even on first address, manager.update unsets existing defaults atomically
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
      expect(mockEntityManager.create).toHaveBeenCalledWith(Address, {
        ...validCreateDto,
        isDefault: true,
        customerId: 1,
      });
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should create first address as default when dto explicitly provides isDefault: true', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(0);

      const result = await service.create(1, { ...validCreateDto, isDefault: true });

      expect(result.isDefault).toBe(true);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
    });

    it('should auto-promote first address to default when dto.isDefault is undefined', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(0);

      const { isDefault, ...dtoWithoutDefault } = validCreateDto;
      const result = await service.create(1, dtoWithoutDefault as CreateAddressDto);

      expect(result.isDefault).toBe(true);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
    });

    it('should unset previously active default atomically when adding a new default address (count > 0, isDefault: true)', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(3);

      const result = await service.create(1, { ...validCreateDto, isDefault: true });

      expect(result.isDefault).toBe(true);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
      expect(mockEntityManager.create).toHaveBeenCalledWith(Address, {
        ...validCreateDto,
        isDefault: true,
        customerId: 1,
      });
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should create non-default address without modifying existing defaults when count > 0 and isDefault is false', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(2);

      const result = await service.create(1, { ...validCreateDto, isDefault: false });

      expect(result.isDefault).toBe(false);
      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.create).toHaveBeenCalledWith(Address, {
        ...validCreateDto,
        isDefault: false,
        customerId: 1,
      });
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should default to isDefault: false when count > 0 and isDefault is omitted', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(1);

      const { isDefault, ...dtoWithoutDefault } = validCreateDto;
      const result = await service.create(1, dtoWithoutDefault as CreateAddressDto);

      expect(result.isDefault).toBe(false);
      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
    });

    it('should atomically roll back and propagate error if manager.save fails', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(0);
      mockEntityManager.save.mockRejectedValue(new Error('DB write deadlock'));

      await expect(service.create(1, validCreateDto)).rejects.toThrow('DB write deadlock');
    });

    it('should atomically roll back and propagate error if manager.update fails', async () => {
      customerRepository.findOne.mockResolvedValue(mockCustomer);
      addressRepository.count.mockResolvedValue(0);
      mockEntityManager.update.mockRejectedValue(new Error('DB lock acquisition timeout'));

      await expect(service.create(1, validCreateDto)).rejects.toThrow('DB lock acquisition timeout');
    });
  });

  // =========================================================================
  // findAllByCustomerId
  // =========================================================================
  describe('findAllByCustomerId', () => {
    it('should return all addresses for customer ordered with default first, then newest', async () => {
      const address1 = createSampleAddress({ id: 101, isDefault: true });
      const address2 = createSampleAddress({
        id: 102,
        isDefault: false,
        createdAt: new Date('2026-03-02T10:00:00Z'),
      });
      addressRepository.find.mockResolvedValue([address1, address2]);

      const result = await service.findAllByCustomerId(1);

      expect(result).toHaveLength(2);
      expect(result).toEqual([address1, address2]);
      expect(addressRepository.find).toHaveBeenCalledWith({
        where: { customerId: 1 },
        order: {
          isDefault: 'DESC',
          createdAt: 'DESC',
        },
      });
    });

    it('should return empty array when customer has no saved addresses', async () => {
      addressRepository.find.mockResolvedValue([]);

      const result = await service.findAllByCustomerId(1);

      expect(result).toEqual([]);
      expect(addressRepository.find).toHaveBeenCalledWith({
        where: { customerId: 1 },
        order: {
          isDefault: 'DESC',
          createdAt: 'DESC',
        },
      });
    });

    it('should propagate database exception if find query fails', async () => {
      addressRepository.find.mockRejectedValue(new Error('Connection terminated'));

      await expect(service.findAllByCustomerId(1)).rejects.toThrow('Connection terminated');
    });
  });

  // =========================================================================
  // findById
  // =========================================================================
  describe('findById', () => {
    it('should return address when matching address exists for the requesting customer', async () => {
      const address = createSampleAddress({ id: 101, customerId: 1 });
      addressRepository.findOne.mockResolvedValue(address);

      const result = await service.findById(101, 1);

      expect(result).toEqual(address);
      expect(addressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 101, customerId: 1 },
      });
    });

    it('should throw NotFoundException if address does not exist at all', async () => {
      addressRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999, 1)).rejects.toThrow(
        new NotFoundException('Address with ID 999 not found'),
      );
      expect(addressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999, customerId: 1 },
      });
    });

    it('should enforce strict tenant isolation (IDOR protection) when address belongs to a different customer', async () => {
      // Address exists for customerId 2, but customerId 1 requests it
      addressRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(101, 1)).rejects.toThrow(
        new NotFoundException('Address with ID 101 not found'),
      );
      expect(addressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 101, customerId: 1 },
      });
    });

    it('should propagate error if findOne fails with database connection failure', async () => {
      addressRepository.findOne.mockRejectedValue(new Error('DB read timeout'));

      await expect(service.findById(101, 1)).rejects.toThrow('DB read timeout');
    });
  });

  // =========================================================================
  // update
  // =========================================================================
  describe('update', () => {
    it('should enforce tenant isolation and throw NotFoundException if address does not belong to customer', async () => {
      addressRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(101, 2, { label: 'Office' }),
      ).rejects.toThrow(new NotFoundException('Address with ID 101 not found'));
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when attempting to unset active default address without replacement', async () => {
      const defaultAddress = createSampleAddress({ id: 101, customerId: 1, isDefault: true });
      addressRepository.findOne.mockResolvedValue(defaultAddress);

      await expect(
        service.update(101, 1, { isDefault: false }),
      ).rejects.toThrow(
        new BadRequestException(
          'Cannot unset default address. Set another address as default instead.',
        ),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should atomically swap default when promoting non-default address to default (dto.isDefault: true)', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
        label: 'Old Label',
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);

      const updateDto: UpdateAddressDto = {
        label: 'Work HQ',
        isDefault: true,
      };

      const result = await service.update(102, 1, updateDto);

      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        Address,
        expect.objectContaining({
          id: 102,
          label: 'Work HQ',
          isDefault: true,
        }),
      );
      expect(result.label).toBe('Work HQ');
      expect(result.isDefault).toBe(true);
    });

    it('should update fields without triggering manager.update when already default address is updated with isDefault: true', async () => {
      const defaultAddress = createSampleAddress({
        id: 101,
        customerId: 1,
        isDefault: true,
        label: 'Home',
      });
      addressRepository.findOne.mockResolvedValue(defaultAddress);

      const updateDto: UpdateAddressDto = {
        label: 'Sweet Home',
        isDefault: true,
      };

      const result = await service.update(101, 1, updateDto);

      // Condition `dto.isDefault === true && !address.isDefault` is false, so update is skipped
      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        Address,
        expect.objectContaining({
          id: 101,
          label: 'Sweet Home',
          isDefault: true,
        }),
      );
      expect(result.label).toBe('Sweet Home');
    });

    it('should update address fields when isDefault is omitted / undefined without triggering manager.update', async () => {
      const address = createSampleAddress({
        id: 101,
        customerId: 1,
        isDefault: true,
        landmark: 'Old Landmark',
      });
      addressRepository.findOne.mockResolvedValue(address);

      const updateDto: UpdateAddressDto = {
        landmark: 'Opposite Shell Pump',
      };

      const result = await service.update(101, 1, updateDto);

      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        Address,
        expect.objectContaining({
          id: 101,
          landmark: 'Opposite Shell Pump',
        }),
      );
      expect(result.landmark).toBe('Opposite Shell Pump');
    });

    it('should update non-default address fields when isDefault is omitted / undefined without triggering manager.update', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
        city: 'Rawalpindi',
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);

      const updateDto: UpdateAddressDto = {
        city: 'Islamabad',
      };

      const result = await service.update(102, 1, updateDto);

      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        Address,
        expect.objectContaining({
          id: 102,
          city: 'Islamabad',
          isDefault: false,
        }),
      );
      expect(result.city).toBe('Islamabad');
    });

    it('should allow updating non-default address with isDefault: false without triggering manager.update', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 103,
        customerId: 1,
        isDefault: false,
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);

      const updateDto: UpdateAddressDto = {
        streetAddress: 'New Street 12',
        isDefault: false,
      };

      const result = await service.update(103, 1, updateDto);

      expect(mockEntityManager.update).not.toHaveBeenCalled();
      expect(mockEntityManager.save).toHaveBeenCalled();
      expect(result.streetAddress).toBe('New Street 12');
      expect(result.isDefault).toBe(false);
    });

    it('should roll back and propagate error if manager.save fails during update', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);
      mockEntityManager.save.mockRejectedValue(new Error('Serialization failure'));

      await expect(
        service.update(102, 1, { isDefault: true }),
      ).rejects.toThrow('Serialization failure');
    });
  });

  // =========================================================================
  // setDefault
  // =========================================================================
  describe('setDefault', () => {
    it('should fast-return existing address without entering a transaction if already default', async () => {
      const defaultAddress = createSampleAddress({
        id: 101,
        customerId: 1,
        isDefault: true,
      });
      addressRepository.findOne.mockResolvedValue(defaultAddress);

      const result = await service.setDefault(101, 1);

      expect(result).toBe(defaultAddress);
      expect(result.isDefault).toBe(true);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should atomically swap default inside transaction when address is not currently default', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);

      const result = await service.setDefault(102, 1);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.update).toHaveBeenCalledWith(
        Address,
        { customerId: 1, isDefault: true },
        { isDefault: false },
      );
      expect(mockEntityManager.save).toHaveBeenCalledWith(
        Address,
        expect.objectContaining({
          id: 102,
          isDefault: true,
        }),
      );
      expect(result.isDefault).toBe(true);
    });

    it('should enforce tenant isolation and throw NotFoundException if address does not belong to customer', async () => {
      addressRepository.findOne.mockResolvedValue(null);

      await expect(service.setDefault(101, 99)).rejects.toThrow(
        new NotFoundException('Address with ID 101 not found'),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should roll back and propagate error if database transaction fails', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);
      mockEntityManager.save.mockRejectedValue(new Error('DB connection drop'));

      await expect(service.setDefault(102, 1)).rejects.toThrow('DB connection drop');
    });
  });

  // =========================================================================
  // remove
  // =========================================================================
  describe('remove', () => {
    it('should enforce tenant isolation and throw NotFoundException if address does not belong to customer', async () => {
      addressRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(101, 99)).rejects.toThrow(
        new NotFoundException('Address with ID 101 not found'),
      );
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should delete a non-default address without querying or promoting remaining addresses', async () => {
      const nonDefaultAddress = createSampleAddress({
        id: 102,
        customerId: 1,
        isDefault: false,
      });
      addressRepository.findOne.mockResolvedValue(nonDefaultAddress);

      await service.remove(102, 1);

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockEntityManager.remove).toHaveBeenCalledWith(Address, nonDefaultAddress);
      expect(mockEntityManager.findOne).not.toHaveBeenCalled();
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it('should delete default address and auto-promote newest remaining address to default', async () => {
      const defaultAddress = createSampleAddress({
        id: 101,
        customerId: 1,
        isDefault: true,
      });
      const remainingNewestAddress = createSampleAddress({
        id: 103,
        customerId: 1,
        isDefault: false,
        createdAt: new Date('2026-03-05T12:00:00Z'),
      });
      addressRepository.findOne.mockResolvedValue(defaultAddress);
      mockEntityManager.findOne.mockResolvedValue(remainingNewestAddress);

      await service.remove(101, 1);

      expect(mockEntityManager.remove).toHaveBeenCalledWith(Address, defaultAddress);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Address, {
        where: { customerId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(remainingNewestAddress.isDefault).toBe(true);
      expect(mockEntityManager.save).toHaveBeenCalledWith(Address, remainingNewestAddress);
    });

    it('should delete default address without error or promotion when it is the sole/single address for the customer', async () => {
      const soleDefaultAddress = createSampleAddress({
        id: 101,
        customerId: 1,
        isDefault: true,
      });
      addressRepository.findOne.mockResolvedValue(soleDefaultAddress);
      mockEntityManager.findOne.mockResolvedValue(null); // No remaining addresses

      await service.remove(101, 1);

      expect(mockEntityManager.remove).toHaveBeenCalledWith(Address, soleDefaultAddress);
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(Address, {
        where: { customerId: 1 },
        order: { createdAt: 'DESC' },
      });
      expect(mockEntityManager.save).not.toHaveBeenCalled();
    });

    it('should roll back and propagate error if manager.remove fails inside transaction', async () => {
      const address = createSampleAddress({ id: 101, customerId: 1, isDefault: false });
      addressRepository.findOne.mockResolvedValue(address);
      mockEntityManager.remove.mockRejectedValue(new Error('Foreign key constraint failure'));

      await expect(service.remove(101, 1)).rejects.toThrow(
        'Foreign key constraint failure',
      );
    });

    it('should roll back and propagate error if promoting newest remaining address fails', async () => {
      const defaultAddress = createSampleAddress({ id: 101, customerId: 1, isDefault: true });
      const remainingAddress = createSampleAddress({ id: 103, customerId: 1, isDefault: false });
      addressRepository.findOne.mockResolvedValue(defaultAddress);
      mockEntityManager.findOne.mockResolvedValue(remainingAddress);
      mockEntityManager.save.mockRejectedValue(new Error('DB failure while promoting new default'));

      await expect(service.remove(101, 1)).rejects.toThrow(
        'DB failure while promoting new default',
      );
    });
  });
});
