import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Outlet } from './outlet.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('outlet_products')
@Unique(['outletId', 'productId'])
@Index(['outletId', 'isAvailable'])
export class OutletProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  outletId: number;

  @ManyToOne(() => Outlet, (outlet) => outlet.outletProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'outletId' })
  outlet: Outlet;

  @Column()
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number) => value,
      from: (value?: string | number) =>
        value !== null && value !== undefined ? parseFloat(value as string) : undefined,
    },
  })
  priceOverride?: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'int', default: 100 })
  stockQuantity: number;

  /**
   * Outlet-Specific Customization Overrides
   * Key: optionId (as number)
   * Value: { priceDeltaOverride?: number; isEnabled?: boolean }
   */
  @Column({ type: 'jsonb', nullable: true })
  customizationOverrides?: Record<
    number,
    {
      priceDeltaOverride?: number;
      isEnabled?: boolean;
    }
  >;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
