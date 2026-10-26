import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Outlet } from './entities/outlet.entity';
import { OutletProduct } from './entities/outlet-product.entity';
import { Merchant } from '../merchants/entities/merchant.entity';

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
}
