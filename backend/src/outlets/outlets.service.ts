import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outlet } from './entities/outlet.entity';
import { OutletProduct } from './entities/outlet-product.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { calculateHaversineDistance } from '../common/utils/geo.util';

export class CreateOutletDto {
  name: string;
  address: string;
  city: string;
  state?: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  isActive?: boolean;
}

export class UpdateOutletDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string[];
  isActive?: boolean;
}

@Injectable()
export class OutletsService {
  constructor(
    @InjectRepository(Outlet)
    private readonly outletRepository: Repository<Outlet>,
    @InjectRepository(OutletProduct)
    private readonly outletProductRepository: Repository<OutletProduct>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async createOutlet(merchantId: number, dto: CreateOutletDto): Promise<Outlet> {
    const merchant = await this.merchantRepository.findOne({ where: { id: merchantId } });
    if (!merchant) {
      throw new NotFoundException(`Merchant #${merchantId} not found`);
    }

    const outlet = this.outletRepository.create({
      merchantId,
      name: dto.name,
      address: dto.address,
      city: dto.city,
      state: dto.state,
      pinCode: dto.pinCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      phoneNumber: dto.phoneNumber,
      openingTime: dto.openingTime,
      closingTime: dto.closingTime,
      workingDays: dto.workingDays,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    return this.outletRepository.save(outlet);
  }

  async getOutletsByMerchantId(merchantId: number): Promise<Outlet[]> {
    return this.outletRepository.find({
      where: { merchantId },
      order: { id: 'ASC' },
    });
  }

  async getOutletById(id: number): Promise<Outlet> {
    const outlet = await this.outletRepository.findOne({
      where: { id },
      relations: { merchant: true },
    });
    if (!outlet) {
      throw new NotFoundException(`Outlet #${id} not found`);
    }
    return outlet;
  }

  async updateOutlet(id: number, dto: UpdateOutletDto): Promise<Outlet> {
    const outlet = await this.getOutletById(id);
    Object.assign(outlet, dto);
    return this.outletRepository.save(outlet);
  }

  async getOutletStorefront(
    outletId: number,
    coords?: { latitude?: number; longitude?: number },
  ) {
    const outlet = await this.outletRepository.findOne({
      where: { id: outletId },
      relations: {
        merchant: {
          merchantCategories: true,
        },
      },
    });

    if (!outlet) {
      throw new NotFoundException(`Outlet #${outletId} not found`);
    }

    const sisterOutletsRaw = await this.outletRepository.find({
      where: { merchantId: outlet.merchantId, isActive: true },
      order: { id: 'ASC' },
    });

    const hasCoords =
      coords?.latitude !== undefined &&
      coords?.latitude !== null &&
      coords?.longitude !== undefined &&
      coords?.longitude !== null;

    const currentOutletDistance = hasCoords
      ? calculateHaversineDistance(
          outlet.latitude,
          outlet.longitude,
          coords!.latitude!,
          coords!.longitude!,
        )
      : null;

    const sisterOutlets = sisterOutletsRaw
      .filter((s) => s.id !== outlet.id)
      .map((s) => {
        const dist = hasCoords
          ? calculateHaversineDistance(
              s.latitude,
              s.longitude,
              coords!.latitude!,
              coords!.longitude!,
            )
          : null;
        return {
          id: s.id,
          name: s.name,
          address: s.address,
          city: s.city,
          state: s.state,
          pinCode: s.pinCode,
          latitude: s.latitude,
          longitude: s.longitude,
          phoneNumber: s.phoneNumber,
          openingTime: s.openingTime,
          closingTime: s.closingTime,
          rating: s.rating,
          distanceKm: dist,
        };
      });

    const outletProducts = await this.outletProductRepository.find({
      where: { outletId, isAvailable: true },
      relations: {
        product: {
          category: true,
          customizationGroups: { options: true },
        },
      },
      order: { productId: 'ASC' },
    });

    const products = outletProducts
      .filter((op) => op.product && op.product.isAvailable)
      .map((op) => ({
        id: op.product.id,
        name: op.product.name,
        description: op.product.description,
        photoUrl: op.product.photoUrl,
        price:
          op.priceOverride !== undefined && op.priceOverride !== null
            ? Number(op.priceOverride)
            : Number(op.product.price),
        basePrice: Number(op.product.price),
        priceOverride:
          op.priceOverride !== undefined && op.priceOverride !== null
            ? Number(op.priceOverride)
            : null,
        stock: op.stockQuantity,
        isAvailable: op.isAvailable && op.stockQuantity > 0,
        merchantId: op.product.merchantId,
        categoryId: op.product.categoryId,
        category: op.product.category,
        customizationGroups: op.product.customizationGroups,
      }));

    return {
      outlet: {
        id: outlet.id,
        merchantId: outlet.merchantId,
        name: outlet.name,
        address: outlet.address,
        city: outlet.city,
        state: outlet.state,
        pinCode: outlet.pinCode,
        latitude: outlet.latitude,
        longitude: outlet.longitude,
        phoneNumber: outlet.phoneNumber,
        openingTime: outlet.openingTime,
        closingTime: outlet.closingTime,
        workingDays: outlet.workingDays,
        isActive: outlet.isActive,
        rating: outlet.rating,
        distanceKm: currentOutletDistance,
      },
      merchant: {
        id: outlet.merchant.id,
        shopName: outlet.merchant.shopName,
        description: outlet.merchant.description,
        rating: outlet.merchant.rating,
        bannerUrl: outlet.merchant.bannerUrl,
        halalCertificateUrl: outlet.merchant.halalCertificateUrl,
        fssaiCertificateUrl: outlet.merchant.fssaiCertificateUrl,
        isVerified: outlet.merchant.isVerified,
        categories: (outlet.merchant.merchantCategories || []).map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
        })),
      },
      sisterOutlets,
      products,
    };
  }
}
