import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { RegisterMerchantDto } from './dtos/register-merchant-dto.dto';
import { UpdateMerchantDto } from './dtos/update-merchant-dto.dto';
import { NearbyMerchantsQueryDto } from './dtos/nearby-merchants-query.dto';
import { User } from 'src/users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/users/enums/role.enum';
import { UsersService } from 'src/users/users.service';
import { AuthenticationService } from 'src/authentication/authentication.service';

export interface NearbyMerchantItem {
    id: number;
    shopName?: string;
    shopAddress?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    latitude?: number;
    longitude?: number;
    distance?: number | null;
    deliveryTimeEstimate: string;
    rating: number;
    bannerUrl?: string;
    halalCertificateUrl?: string;
    fssaiCertificateUrl?: string;
    openingTime: string;
    closingTime: string;
    workingDays?: string[];
    isVerified: boolean;
    productCount: number;
    featuredProducts: string[];
    categories: { id: number; slug: string; name: string }[];
}

@Injectable()
export class MerchantsService {
    constructor(
        @InjectRepository(Merchant)
        private readonly merchantRepository: Repository<Merchant>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
        private readonly authenticationService: AuthenticationService,
    ) {}

    async register(registerMerchantDto: RegisterMerchantDto) {
        const {
            name,
            email,
            password,
            phoneNumber,
            shopName,
            shopAddress,
            city,
            state,
            pinCode,
            latitude,
            longitude,
            bannerUrl,
            halalCertificateUrl,
            fssaiCertificateUrl,
            gstin,
            accountHolderName,
            bankName,
            ifscCode,
            openingTime,
            closingTime,
            workingDays,
        } = registerMerchantDto;

        const existingUser = email
            ? await this.usersService.findOne(email, phoneNumber)
            : await this.usersService.findOneByPhone(phoneNumber);

        if (existingUser) {
            throw new ConflictException('User with this email or phone number already exists');
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const { savedUser, savedMerchant } = await this.dataSource.transaction(async (manager) => {
            const savedUser = await manager.save(User, {
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                role: Role.MERCHANT,
            });

            const savedMerchant = await manager.save(Merchant, {
                user: savedUser,
                shopName: shopName || name,
                shopAddress,
                city,
                state,
                pinCode,
                latitude,
                longitude,
                bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
                rating: 0,
                halalCertificateUrl,
                fssaiCertificateUrl,
                gstin,
                accountHolderName,
                bankName,
                ifscCode,
                openingTime: openingTime || '08:00 AM',
                closingTime: closingTime || '09:00 PM',
                workingDays: workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                isVerified: false,
            });

            return { savedUser, savedMerchant };
        });

        const { password: savedPassword, ...userWithoutPassword } = savedUser;
        const { accessToken, refreshToken } = await this.authenticationService.generateTokens(savedUser);

        return {
            user: userWithoutPassword,
            merchant: savedMerchant,
            accessToken,
            refreshToken,
        };
    }

    async findNearby(query: NearbyMerchantsQueryDto): Promise<NearbyMerchantItem[]> {
        const { latitude, longitude, radius = 25, city, search } = query;
        const hasCoordinates =
            latitude !== undefined &&
            longitude !== undefined &&
            !isNaN(Number(latitude)) &&
            !isNaN(Number(longitude));

        const qb = this.merchantRepository.createQueryBuilder('merchant')
            .leftJoinAndSelect('merchant.user', 'user')
            .leftJoinAndSelect('merchant.merchantCategories', 'merchantCategories');

        if (hasCoordinates) {
            const lat = Number(latitude);
            const lng = Number(longitude);

            qb.andWhere('merchant.latitude IS NOT NULL AND merchant.longitude IS NOT NULL');

            const haversineSql = `(6371 * acos(
                least(1.0, greatest(-1.0,
                    cos(radians(:lat)) * cos(radians(merchant.latitude)) *
                    cos(radians(merchant.longitude) - radians(:lng)) +
                    sin(radians(:lat)) * sin(radians(merchant.latitude))
                ))
            ))`;

            qb.addSelect(haversineSql, 'distance');
            qb.setParameters({ lat, lng });

            if (radius) {
                qb.andWhere(`${haversineSql} <= :radius`, { radius: Number(radius) });
            }

            qb.orderBy('distance', 'ASC');
        } else {
            qb.orderBy('merchant.rating', 'DESC');
        }

        if (city) {
            qb.andWhere('LOWER(merchant.city) = LOWER(:city)', { city: city.trim() });
        }

        if (search) {
            qb.andWhere(
                '(LOWER(merchant.shopName) LIKE :search OR LOWER(merchant.city) LIKE :search OR LOWER(merchant.shopAddress) LIKE :search)',
                { search: `%${search.trim().toLowerCase()}%` }
            );
        }

        const { entities, raw } = await qb.getRawAndEntities();

        if (entities.length === 0) {
            return [];
        }

        const merchantIds = entities.map((m) => m.id);

        // Batch-query products for all nearby merchants in a single database roundtrip
        const allProducts = await this.productRepository.find({
            where: { merchantId: In(merchantIds), isAvailable: true },
            select: { id: true, name: true, merchantId: true },
            order: { createdAt: 'DESC' },
        });

        // Group featured products (up to 4) and total counts per merchant in memory
        const featuredProductsMap = new Map<number, string[]>();
        const productCountMap = new Map<number, number>();

        for (const p of allProducts) {
            const currentList = featuredProductsMap.get(p.merchantId) ?? [];
            if (currentList.length < 4) {
                currentList.push(p.name);
                featuredProductsMap.set(p.merchantId, currentList);
            }
            productCountMap.set(p.merchantId, (productCountMap.get(p.merchantId) ?? 0) + 1);
        }

        const results: NearbyMerchantItem[] = [];

        for (let i = 0; i < entities.length; i++) {
            const merchant = entities[i];
            const rawRow = raw[i];
            const rawDist =
                rawRow?.distance !== undefined && rawRow?.distance !== null
                    ? parseFloat(rawRow.distance)
                    : null;
            const distance = rawDist !== null ? Number(rawDist.toFixed(1)) : null;

            // Delivery time estimate based on distance
            let deliveryTimeEstimate = '25-40 mins';
            if (distance !== null) {
                if (distance <= 3) {
                    deliveryTimeEstimate = '15-25 mins';
                } else if (distance <= 7) {
                    deliveryTimeEstimate = '25-40 mins';
                } else if (distance <= 15) {
                    deliveryTimeEstimate = '40-60 mins';
                } else {
                    deliveryTimeEstimate = '60-90 mins';
                }
            }

            results.push({
                id: merchant.id,
                shopName: merchant.shopName,
                shopAddress: merchant.shopAddress,
                city: merchant.city,
                state: merchant.state,
                pinCode: merchant.pinCode,
                latitude: merchant.latitude,
                longitude: merchant.longitude,
                distance,
                deliveryTimeEstimate,
                rating: merchant.rating ?? 0,
                bannerUrl: merchant.bannerUrl,
                halalCertificateUrl: merchant.halalCertificateUrl,
                fssaiCertificateUrl: merchant.fssaiCertificateUrl,
                openingTime: merchant.openingTime || '',
                closingTime: merchant.closingTime || '',
                workingDays: merchant.workingDays,
                isVerified: merchant.isVerified,
                productCount: productCountMap.get(merchant.id) ?? 0,
                featuredProducts: featuredProductsMap.get(merchant.id) ?? [],
                categories: (merchant.merchantCategories || []).map((c) => ({
                    id: c.id,
                    slug: c.slug,
                    name: c.name,
                })),
            });
        }

        return results;
    }

    async getStorefront(merchantId: number) {
        const merchant = await this.findById(merchantId);
        const products = await this.productRepository.find({
            where: { merchantId: merchant.id, isAvailable: true },
            order: { createdAt: 'DESC' },
        });

        return {
            id: merchant.id,
            shopName: merchant.shopName,
            shopAddress: merchant.shopAddress,
            city: merchant.city,
            state: merchant.state,
            pinCode: merchant.pinCode,
            latitude: merchant.latitude,
            longitude: merchant.longitude,
            rating: merchant.rating ?? 0,
            bannerUrl: merchant.bannerUrl,
            halalCertificateUrl: merchant.halalCertificateUrl,
            fssaiCertificateUrl: merchant.fssaiCertificateUrl,
            openingTime: merchant.openingTime || '',
            closingTime: merchant.closingTime || '',
            workingDays: merchant.workingDays,
            isVerified: merchant.isVerified,
            categories: (merchant.merchantCategories || []).map((c) => ({
                id: c.id,
                slug: c.slug,
                name: c.name,
            })),
            products,
        };
    }

    async findByUserId(userId: number): Promise<Merchant> {
        const merchant = await this.merchantRepository.findOne({
            where: { user: { id: userId } },
            relations: { user: true },
        });

        if (!merchant) {
            throw new NotFoundException(`Merchant for user #${userId} not found`);
        }

        return merchant;
    }

    async findById(id: number): Promise<Merchant> {
        const merchant = await this.merchantRepository.findOne({
            where: { id },
            relations: { user: true, merchantCategories: true },
        });

        if (!merchant) {
            throw new NotFoundException(`Merchant #${id} not found`);
        }

        return merchant;
    }

    async updateByUserId(userId: number, updateDto: UpdateMerchantDto): Promise<Merchant> {
        const merchant = await this.findByUserId(userId);
        Object.assign(merchant, updateDto);
        return this.merchantRepository.save(merchant);
    }
}