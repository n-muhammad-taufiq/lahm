import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { CustomizationOption } from './customization-option.entity';

@Entity('customization_groups')
export class CustomizationGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (product: any) => product.customizationGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  name: string; // e.g. "Preparation", "Portion Size", "Spice Level", "Add-ons"

  @Column({ type: 'int', default: 0 })
  minSelect: number; // 0 = optional, 1 = mandatory

  @Column({ type: 'int', default: 1 })
  maxSelect: number; // 1 = radio (single-choice), >1 = checkboxes (multi-select)

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => CustomizationOption, (option: any) => option.group, {
    cascade: true,
    eager: true,
  })
  options: CustomizationOption[];
}
