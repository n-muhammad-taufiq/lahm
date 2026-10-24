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
import { Product } from './product.entity';

@Entity('product_categories')
@Index(['merchantId', 'parentId'])
@Index(['merchantId', 'depth'])
export class ProductCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  merchantId: number;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchantId' })
  merchant: Merchant;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  parentId: number | null;

  @ManyToOne(() => ProductCategory, (cat) => cat.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  parent: ProductCategory | null;

  @OneToMany(() => ProductCategory, (cat) => cat.parent)
  children: ProductCategory[];

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column({ type: 'int', default: 1 })
  depth: number; // 1 = Root (e.g. Biryani), 2 = Subcategory, 3 = Level 3, 4 = Max Leaf

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
