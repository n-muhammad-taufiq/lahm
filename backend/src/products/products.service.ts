import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { MerchantsService } from "../merchants/merchants.service";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly merchantsService: MerchantsService,
    ) {}

    async create(createProductDto: CreateProductDto): Promise<Product> {
        await this.merchantsService.findById(createProductDto.merchantId);

        const product = this.productRepository.create({
            ...createProductDto,
            stock: createProductDto.stock ?? 0,
            isAvailable: createProductDto.isAvailable ?? true,
        });

        return this.productRepository.save(product);
    }

    async findById(id: number): Promise<Product> {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: { merchant: true },
        });

        if (!product) {
            throw new NotFoundException(`Product #${id} not found`);
        }

        return product;
    }

    async findByMerchantId(merchantId: number): Promise<Product[]> {
        return this.productRepository.find({
            where: { merchantId },
            order: { id: 'DESC' },
        });
    }

    async findAll(merchantId?: number): Promise<Product[]> {
        if (merchantId) {
            return this.findByMerchantId(merchantId);
        }
        return this.productRepository.find({
            order: { id: 'DESC' },
        });
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.findById(id);

        if (
            updateProductDto.merchantId !== undefined &&
            updateProductDto.merchantId !== product.merchantId
        ) {
            await this.merchantsService.findById(updateProductDto.merchantId);
        }

        const { meatDetails, ...baseUpdates } = updateProductDto;

        Object.assign(product, baseUpdates);

        if (meatDetails) {
            if (product.meatDetails) {
                Object.assign(product.meatDetails, meatDetails);
            } else {
                product.meatDetails = meatDetails as any;
            }
        }

        return this.productRepository.save(product);
    }

    async remove(id: number): Promise<{ message: string; id: number }> {
        const product = await this.findById(id);
        await this.productRepository.remove(product);

        return {
            message: `Product #${id} deleted successfully`,
            id,
        };
    }
}
