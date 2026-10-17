import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Merchant } from "../../merchants/entities/merchant.entity";
import { ProductVertical } from "../enums/product-vertical.enum";
import { MeatProductDetails } from "./meat-product-details.entity";
import { CustomizationGroup } from "./customization-group.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ProductVertical,
    })
    vertical?: ProductVertical;

    @OneToOne(() => MeatProductDetails, (details) => details.product, {
        cascade: true,
        eager: true,
        nullable: true,
    })
    meatDetails?: MeatProductDetails;

    @OneToMany(() => CustomizationGroup, (group) => group.product, {
        cascade: true,
        eager: true,
    })
    customizationGroups?: CustomizationGroup[];

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ nullable: true })
    photoUrl?: string;

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
    price: number;

    @Column({ type: 'int', default: 0 })
    stock: number;

    @Column({ type: 'boolean', default: true })
    isAvailable: boolean;

    @Column()
    merchantId: number;

    @ManyToOne(() => Merchant, (merchant) => merchant.products, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'merchantId' })
    merchant: Merchant;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
