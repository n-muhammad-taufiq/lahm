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
import { Merchant } from '../../merchants/entities/merchant.entity';
import { OutletProduct } from './outlet-product.entity';

@Entity('outlets')
@Index(['merchantId', 'isActive'])
@Index(['latitude', 'longitude'])
export class Outlet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  merchantId: number;

  @ManyToOne(() => Merchant, (merchant) => merchant.outlets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  name: string; // e.g. "Thousand Lights", "Anna Nagar", "Velachery"

  @Column({ type: 'text' })
  address: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state?: string;

  @Column()
  pinCode: string;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: '08:00 AM' })
  openingTime: string;

  @Column({ default: '11:00 PM' })
  closingTime: string;

  @Column({ type: 'simple-array', nullable: true })
  workingDays?: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @OneToMany(() => OutletProduct, (op) => op.outlet)
  outletProducts: OutletProduct[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
