import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { DeliveryPartner } from '../../delivery-partners/entities/delivery-partner.entity';
import { DeliveryRequestStatus, DispatchStage } from '../enums/delivery-request.enum';

@Index(['deliveryPartnerId', 'status'])
@Index(['status', 'expiresAt'])
@Index(['orderId', 'status'])
@Entity('delivery_requests')
export class DeliveryRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Index()
  @Column({ nullable: true })
  deliveryPartnerId?: number;

  @ManyToOne(() => DeliveryPartner, { nullable: true, onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'deliveryPartnerId' })
  deliveryPartner?: DeliveryPartner;

  @Index()
  @Column({
    type: 'enum',
    enum: DeliveryRequestStatus,
    default: DeliveryRequestStatus.PENDING,
  })
  status: DeliveryRequestStatus;

  @Column({
    type: 'enum',
    enum: DispatchStage,
    default: DispatchStage.SERIAL,
  })
  stage: DispatchStage;

  @Column({ default: 1 })
  attemptNumber: number;

  @Column('decimal', {
    precision: 6,
    scale: 2,
    transformer: {
      to: (val?: number) => val,
      from: (val?: string) => (val ? parseFloat(val) : 0),
    },
  })
  distanceKm: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (val?: number) => val,
      from: (val?: string) => (val ? parseFloat(val) : 0),
    },
  })
  estimatedPayout: number;

  @Index()
  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  respondedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
