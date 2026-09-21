import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Merchant } from "../../merchants/entities/merchant.entity";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

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
