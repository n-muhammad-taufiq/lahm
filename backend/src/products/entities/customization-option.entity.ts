import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomizationGroup } from './customization-group.entity';

@Entity('customization_options')
export class CustomizationOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @ManyToOne(() => CustomizationGroup, (group: any) => group.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: CustomizationGroup;

  @Column()
  name: string; // e.g. "Skinless", "Curry Cut", "Large", "Extra Salna"

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
  priceDelta: number; // Surcharge relative to base price (e.g. 20.00, 0.00)

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;
}
