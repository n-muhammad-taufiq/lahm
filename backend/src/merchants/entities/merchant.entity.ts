import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Product } from "../../products/entities/product.entity";

@Entity()
export class Merchant {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @OneToMany(() => Product, (product) => product.merchant)
    products: Product[];

    // Step 2: Shop Details
    @Column({ nullable: true })
    shopName?: string;

    @Column({ type: 'text', nullable: true })
    shopAddress?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    pinCode?: string;

    @Column({ type: 'double precision', nullable: true })
    latitude?: number;

    @Column({ type: 'double precision', nullable: true })
    longitude?: number;

    @Column({ type: 'float', default: 0 })
    rating: number;

    @Column({ nullable: true })
    bannerUrl?: string;

    // Step 3: Business Verification
    @Column({ nullable: true })
    halalCertificateUrl?: string;

    @Column({ nullable: true })
    fssaiCertificateUrl?: string;

    @Column({ nullable: true })
    gstin?: string;

    // Step 4: Settlement Information
    @Column({ nullable: true })
    accountHolderName?: string;

    @Column({ nullable: true })
    bankName?: string;

    @Column({ nullable: true })
    ifscCode?: string;

    // Step 5: Store Operations & Timings
    @Column({ default: '08:00 AM' })
    openingTime: string;

    @Column({ default: '09:00 PM' })
    closingTime: string;

    @Column({ type: 'simple-array', nullable: true })
    workingDays?: string[];

    // Verification & Status
    @Column({ default: false })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}