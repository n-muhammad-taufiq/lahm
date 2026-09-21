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
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";

describe('ProductsController', () => {
    let controller: ProductsController;
    let productsService: jest.Mocked<ProductsService>;

    const mockProduct = {
        id: 1,
        name: 'Fresh Lamb Chop',
        description: 'Premium cut halal lamb chop',
        photoUrl: 'https://example.com/lamb.jpg',
        price: 25.5,
        stock: 50,
        isAvailable: true,
        merchantId: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: {
                        create: jest.fn(),
                        findById: jest.fn(),
                        findByMerchantId: jest.fn(),
                        findAll: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
        productsService = module.get(ProductsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('should call productsService.findAll when merchantId is not provided', async () => {
            productsService.findAll.mockResolvedValue([mockProduct as any]);

            const result = await controller.findAll();

            expect(productsService.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockProduct]);
        });

        it('should call productsService.findByMerchantId when merchantId is provided', async () => {
            productsService.findByMerchantId.mockResolvedValue([mockProduct as any]);

            const result = await controller.findAll('10');

            expect(productsService.findByMerchantId).toHaveBeenCalledWith(10);
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('findByMerchantId', () => {
        it('should call productsService.findByMerchantId with merchantId', async () => {
            productsService.findByMerchantId.mockResolvedValue([mockProduct as any]);

            const result = await controller.findByMerchantId(10);

            expect(productsService.findByMerchantId).toHaveBeenCalledWith(10);
            expect(result).toEqual([mockProduct]);
        });
    });

    describe('findOne', () => {
        it('should call productsService.findById with id', async () => {
            productsService.findById.mockResolvedValue(mockProduct as any);

            const result = await controller.findOne(1);

            expect(productsService.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('create', () => {
        it('should call productsService.create and return created product', async () => {
            const dto: CreateProductDto = {
                name: 'Fresh Lamb Chop',
                price: 25.5,
                merchantId: 10,
            };

            productsService.create.mockResolvedValue(mockProduct as any);

            const result = await controller.create(dto);

            expect(productsService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('update', () => {
        it('should call productsService.update with PATCH and return updated product', async () => {
            const dto: UpdateProductDto = {
                price: 29.99,
            };
            const updatedProduct = { ...mockProduct, price: 29.99 };

            productsService.update.mockResolvedValue(updatedProduct as any);

            const result = await controller.update(1, dto);

            expect(productsService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toEqual(updatedProduct);
        });

        it('should call productsService.update with PUT and return updated product', async () => {
            const dto: UpdateProductDto = {
                name: 'Updated Product Name',
            };
            const updatedProduct = { ...mockProduct, name: 'Updated Product Name' };

            productsService.update.mockResolvedValue(updatedProduct as any);

            const result = await controller.updateWithPut(1, dto);

            expect(productsService.update).toHaveBeenCalledWith(1, dto);
            expect(result).toEqual(updatedProduct);
        });
    });

    describe('remove', () => {
        it('should call productsService.remove and return deletion response', async () => {
            const expectedResponse = {
                message: 'Product #1 deleted successfully',
                id: 1,
            };

            productsService.remove.mockResolvedValue(expectedResponse);

            const result = await controller.remove(1);

            expect(productsService.remove).toHaveBeenCalledWith(1);
            expect(result).toEqual(expectedResponse);
        });
    });
});
