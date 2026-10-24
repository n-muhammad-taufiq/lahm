import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('merchant_categories')
export class MerchantCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string; // e.g. 'meats', 'restaurants', 'groceries', 'bakery'

  @Column()
  name: string; // e.g. 'Meat Shops', 'Restaurants', 'Groceries'

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  iconUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Merchant, (merchant) => merchant.merchantCategories)
  merchants: Merchant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
