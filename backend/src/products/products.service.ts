import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import { Product } from "./entities/product.entity";
import { ProductCategory } from "./entities/product-category.entity";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { MerchantsService } from "../merchants/merchants.service";
import { CategoryTreeNode } from "./interfaces/category-tree-node.interface";

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        @InjectRepository(ProductCategory)
        private readonly productCategoryRepository: Repository<ProductCategory>,
        private readonly merchantsService: MerchantsService,
        private readonly configService: ConfigService,
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

    async getMerchantCategories(
        merchantId: number,
        parentId?: number,
        tree: boolean = false,
    ): Promise<CategoryTreeNode[] | any[]> {
        await this.merchantsService.findById(merchantId);
        const maxDepth = Number(this.configService.get<number>('MAX_CATEGORY_DEPTH', 4));

        if (tree) {
            const allCategories = await this.productCategoryRepository.find({
                where: { merchantId, isActive: true },
                order: { sortOrder: 'ASC', id: 'ASC' },
            });

            const productCounts = await this.productRepository
                .createQueryBuilder('product')
                .select('product.categoryId', 'categoryId')
                .addSelect('COUNT(product.id)', 'count')
                .where('product.merchantId = :merchantId', { merchantId })
                .andWhere('product.isAvailable = true')
                .groupBy('product.categoryId')
                .getRawMany();

            const countMap = new Map<number, number>();
            for (const row of productCounts) {
                if (row.categoryId) {
                    countMap.set(Number(row.categoryId), parseInt(row.count, 10));
                }
            }

            return this.buildCategoryTree(allCategories, countMap, maxDepth);
        }

        const categories = await this.productCategoryRepository.find({
            where: {
                merchantId,
                isActive: true,
                parentId: parentId !== undefined && !isNaN(parentId) ? parentId : IsNull(),
            },
            order: { sortOrder: 'ASC', id: 'ASC' },
            relations: { children: true },
        });

        return categories.map((cat) => ({
            id: cat.id,
            merchantId: cat.merchantId,
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl,
            parentId: cat.parentId,
            depth: cat.depth,
            sortOrder: cat.sortOrder,
            isActive: cat.isActive,
            hasChildren: (cat.children?.length ?? 0) > 0,
        }));
    }

    private buildCategoryTree(
        categories: ProductCategory[],
        countMap: Map<number, number>,
        maxDepth: number,
    ): CategoryTreeNode[] {
        const nodeMap = new Map<number, CategoryTreeNode>();

        for (const cat of categories) {
            if (cat.depth <= maxDepth) {
                nodeMap.set(cat.id, {
                    id: cat.id,
                    merchantId: cat.merchantId,
                    name: cat.name,
                    description: cat.description,
                    imageUrl: cat.imageUrl,
                    parentId: cat.parentId,
                    depth: cat.depth,
                    sortOrder: cat.sortOrder,
                    isActive: cat.isActive,
                    productCount: countMap.get(cat.id) ?? 0,
                    hasChildren: false,
                    children: [],
                });
            }
        }

        const roots: CategoryTreeNode[] = [];
        for (const node of nodeMap.values()) {
            if (node.parentId && nodeMap.has(node.parentId)) {
                const parent = nodeMap.get(node.parentId)!;
                parent.children.push(node);
                parent.hasChildren = true;
            } else if (!node.parentId) {
                roots.push(node);
            }
        }

        return roots;
    }

    async getMerchantCatalog(
        merchantId: number,
        query: { categoryId?: number; search?: string; page?: number; limit?: number },
    ) {
        await this.merchantsService.findById(merchantId);

        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
        const skip = (page - 1) * limit;

        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.customizationGroups', 'customizationGroups')
            .leftJoinAndSelect('customizationGroups.options', 'options')
            .where('product.merchantId = :merchantId', { merchantId })
            .andWhere('product.isAvailable = true');

        if (query.categoryId !== undefined && !isNaN(query.categoryId)) {
            const category = await this.productCategoryRepository.findOne({
                where: { id: query.categoryId, merchantId },
            });
            if (!category) {
                throw new NotFoundException(`Category #${query.categoryId} not found for this merchant`);
            }
            qb.andWhere('product.categoryId = :catId', { catId: query.categoryId });
        }

        if (query.search && query.search.trim().length > 0) {
            qb.andWhere('(LOWER(product.name) LIKE :search OR LOWER(product.description) LIKE :search)', {
                search: `%${query.search.trim().toLowerCase()}%`,
            });
        }

        qb.orderBy('product.id', 'ASC').skip(skip).take(limit);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}

