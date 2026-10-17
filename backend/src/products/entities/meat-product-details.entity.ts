import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { MeatSpecies } from '../enums/meat-species.enum';
import { MeatCutType } from '../enums/meat-cut-type.enum';
import { BoneType } from '../enums/bone-type.enum';

@Entity('meat_product_details')
export class MeatProductDetails {
  @PrimaryColumn()
  productId: number;

  @OneToOne(() => Product, (product: any) => product.meatDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  // 1. Animal / Species Classification
  @Column({ type: 'enum', enum: MeatSpecies })
  species: MeatSpecies;

  // 2. Allowed Cut Options configured by Butcher (e.g. Curry Cut, Biryani, Fry, Kothu Kari)
  @Column({ type: 'simple-array' })
  availableCuts: MeatCutType[];

  // 3. Allowed Bone Options (e.g. With Bone, Boneless)
  @Column({ type: 'simple-array' })
  availableBoneTypes: BoneType[];

  // 4. Allowed Pack Weights in Grams (e.g. 250, 500, 1000)
  @Column({ type: 'simple-array' })
  availableWeightsGrams: number[];

  // 5. Defaults for 1-Tap Quick Ordering
  @Column({ type: 'enum', enum: MeatCutType, default: MeatCutType.CURRY_CUT })
  defaultCut: MeatCutType;

  @Column({ type: 'enum', enum: BoneType, default: BoneType.BONE_IN })
  defaultBoneType: BoneType;

  @Column({ type: 'int', default: 500 })
  defaultWeightGrams: number;

  // 6. Boneless Surcharge (e.g. +₹80 when customer picks Boneless)
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
  bonelessExtraPrice: number;

  // 7. Halal Certification Trust Seal
  @Column({ default: true })
  isZabihahHalal: boolean;
}
