import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Outlet } from '../../outlets/entities/outlet.entity';
import { DeliveryPartner } from '../../delivery-partners/entities/delivery-partner.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  customerId: number;

  @ManyToOne(() => Customer, { eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Index()
  @Column()
  merchantId: number;

  @ManyToOne(() => Merchant, { eager: false })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Index()
  @Column({ nullable: true })
  outletId?: number;

  @ManyToOne(() => Outlet, { nullable: true, eager: false })
  @JoinColumn({ name: 'outletId' })
  outlet?: Outlet;

  @Index()
  @Column({ nullable: true })
  deliveryPartnerId?: number;

  @ManyToOne(() => DeliveryPartner, { nullable: true, eager: false })
  @JoinColumn({ name: 'deliveryPartnerId' })
  deliveryPartner?: DeliveryPartner;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PLACED,
  })
  status: OrderStatus;

  // Financial Breakdown (Server-Calculated Snapshots)
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? parseFloat(value as string) : value,
    },
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? parseFloat(value as string) : value,
    },
  })
  deliveryFee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? parseFloat(value as string) : value,
    },
  })
  platformFee: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        value !== null && value !== undefined ? parseFloat(value as string) : value,
    },
  })
  total: number;

  // Delivery & Dropoff Information
  @Column({ type: 'text' })
  deliveryAddress: string;

  @Column({ type: 'double precision', nullable: true })
  deliveryLatitude?: number;

  @Column({ type: 'double precision', nullable: true })
  deliveryLongitude?: number;

  @Column({ type: 'float', nullable: true })
  distanceKm?: number;

  // Customer Dropoff Verification OTP (4 digits)
  @Column({ length: 4 })
  deliveryOtp: string;

  // Merchant / Delivery / System notes or cancellation reason
  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
