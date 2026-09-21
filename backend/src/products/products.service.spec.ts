jest.mock('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
    cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(() => ({
        verifyIdToken: jest.fn(),
    })),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ProductsService } from "./products.service";
import { Product } from "./entities/product.entity";
import { MerchantsService } from "../merchants/merchants.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";

describe('ProductsService', () => {
    let service: ProductsService;
    let productRepository: jest.Mocked<Repository<Product>>;
    let merchantsService: jest.Mocked<MerchantsService>;

    const mockProduct: Product = {
        id: 1,
        name: 'Fresh Lamb Chop',
        description: 'Premium cut halal lamb chop',
        photoUrl: 'https://example.com/lamb.jpg',
        price: 25.5,
        stock: 50,
        isAvailable: true,
        merchantId: 10,
        merchant: null as any,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        find: jest.fn(),
                        remove: jest.fn(),
                    },
                },
                {
                    provide: MerchantsService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        productRepository = module.get(getRepositoryToken(Product));
        merchantsService = module.get(MerchantsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should validate merchant and successfully save product', async () => {
            const dto: CreateProductDto = {
                name: 'Fresh Lamb Chop',
                description: 'Premium cut halal lamb chop',
                photoUrl: 'https://example.com/lamb.jpg',
                price: 25.5,
                stock: 50,
                isAvailable: true,
                merchantId: 10,
            };

            merchantsService.findById.mockResolvedValue({ id: 10 } as any);
            productRepository.create.mockReturnValue(mockProduct);
            productRepository.save.mockResolvedValue(mockProduct);

            const result = await service.create(dto);

            expect(merchantsService.findById).toHaveBeenCalledWith(10);
            expect(productRepository.create).toHaveBeenCalledWith({
                ...dto,
                stock: 50,
                isAvailable: true,
            });
            expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
            expect(result).toEqual(mockProduct);
        });

        it('should use default values for stock (0) and isAvailable (true) if omitted', async () => {
            const dto: CreateProductDto = {
                name: 'Fresh Beef Ribs',
                price: 30,
                merchantId: 10,
            };

            merchantsService.findById.mockResolvedValue({ id: 10 } as any);
            productRepository.create.mockReturnValue({ ...mockProduct, stock: 0, isAvailable: true });
            productRepository.save.mockResolvedValue({ ...mockProduct, stock: 0, isAvailable: true });

            await service.create(dto);

            expect(productRepository.create).toHaveBeenCalledWith({
                ...dto,
                stock: 0,
                isAvailable: true,
            });
        });

        it('should throw NotFoundException if merchant does not exist', async () => {
            const dto: CreateProductDto = {
                name: 'Item',
                price: 10,
                merchantId: 999,
            };

            merchantsService.findById.mockRejectedValue(new NotFoundException('Merchant #999 not found'));

            await expect(service.create(dto)).rejects.toThrow(NotFoundException);
            expect(productRepository.create).not.toHaveBeenCalled();
            expect(productRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return product if found', async () => {
            productRepository.findOne.mockResolvedValue(mockProduct);

            const result = await service.findById(1);

            expect(productRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: { merchant: true },
            });
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException if product is not found', async () => {
            productRepository.findOne.mockResolvedValue(null);

            await expect(service.findById(99)).rejects.toThrow(
                new NotFoundException('Product #99 not found'),
            );
        });
    });

    describe('findByMerchantId', () => {
        it('should return all products for a given merchant', async () => {
            productRepository.find.mockResolvedValue([mockProduct]);

            const result = await service.findByMerchantId(10);

            expect(productRepository.find).toHaveBeenCalledWith({
                where: { merchantId: 10 },
                order: { id: 'DESC' },
            });
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('findAll', () => {
        it('should return all products when no merchantId is provided', async () => {
            productRepository.find.mockResolvedValue([mockProduct]);

            const result = await service.findAll();

            expect(productRepository.find).toHaveBeenCalledWith({
                order: { id: 'DESC' },
            });
            expect(result).toEqual([mockProduct]);
        });

        it('should filter by merchantId when merchantId is provided', async () => {
            productRepository.find.mockResolvedValue([mockProduct]);

            const result = await service.findAll(10);

            expect(productRepository.find).toHaveBeenCalledWith({
                where: { merchantId: 10 },
                order: { id: 'DESC' },
            });
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('update', () => {
        it('should update product successfully', async () => {
            const updateDto: UpdateProductDto = {
                price: 29.99,
                stock: 45,
            };

            const existingProduct = { ...mockProduct };
            productRepository.findOne.mockResolvedValue(existingProduct);
            productRepository.save.mockImplementation(async (entity) => entity as Product);

            const result = await service.update(1, updateDto);

            expect(productRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: { merchant: true },
            });
            expect(result.price).toBe(29.99);
            expect(result.stock).toBe(45);
            expect(productRepository.save).toHaveBeenCalled();
        });

        it('should validate merchant when merchantId is being updated', async () => {
            const updateDto: UpdateProductDto = {
                merchantId: 20,
            };

            const existingProduct = { ...mockProduct, merchantId: 10 };
            productRepository.findOne.mockResolvedValue(existingProduct);
            merchantsService.findById.mockResolvedValue({ id: 20 } as any);
            productRepository.save.mockImplementation(async (entity) => entity as Product);

            const result = await service.update(1, updateDto);

            expect(merchantsService.findById).toHaveBeenCalledWith(20);
            expect(result.merchantId).toBe(20);
        });

        it('should throw NotFoundException if product to update is not found', async () => {
            productRepository.findOne.mockResolvedValue(null);

            await expect(service.update(99, { name: 'New Name' })).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('should delete product successfully', async () => {
            productRepository.findOne.mockResolvedValue(mockProduct);
            productRepository.remove.mockResolvedValue(mockProduct);

            const result = await service.remove(1);

            expect(productRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: { merchant: true },
            });
            expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
            expect(result).toEqual({
                message: 'Product #1 deleted successfully',
                id: 1,
            });
        });

        it('should throw NotFoundException if product to delete is not found', async () => {
            productRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(99)).rejects.toThrow(NotFoundException);
            expect(productRepository.remove).not.toHaveBeenCalled();
        });
    });
});
