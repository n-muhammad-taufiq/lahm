import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Index(['isOnline', 'activeOrderCount', 'isVerified'])
@Index(['lastLocationUpdatedAt'])
@Entity()
export class DeliveryPartner {
    @PrimaryGeneratedColumn()
    id: number;
    
    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    // Step 2: Personal Details
    @Column({ nullable: true })
    dateOfBirth?: string;

    @Column({ type: 'text', nullable: true })
    addressLine?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    pinCode?: string;

    // Step 3: Vehicle Details
    @Column({ nullable: true })
    vehicleType?: string; // 'motorcycle' | 'scooter' | 'bicycle'

    @Column({ nullable: true })
    vehicleRegistrationNumber?: string;

    @Column({ nullable: true })
    drivingLicenseNumber?: string;

    @Column({ nullable: true })
    drivingLicensePhotoUrl?: string;

    @Column({ nullable: true })
    vehicleRcPhotoUrl?: string;

    // Step 4: Payment Details
    @Column({ nullable: true })
    accountHolderName?: string;

    @Column({ nullable: true })
    bankAccountNumber?: string;

    @Column({ nullable: true })
    ifsc?: string;

    @Column({ nullable: true })
    bankName?: string;

    // Step 5: Delivery Preferences
    @Column({ nullable: true })
    preferredDeliveryArea?: string;

    @Column({ nullable: true })
    workingHours?: string;

    @Column({ nullable: true })
    maxDeliveryRadiusKm?: string;

    // Status & Auditing
    @Column({ default: false })
    isVerified: boolean;

    // Duty, Concurrency & Live Location Tracking
    @Column({ default: false })
    isOnline: boolean;

    @Column({ default: 0 })
    activeOrderCount: number;

    @Column('decimal', {
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: {
            to: (value?: number) => value,
            from: (value?: string) => (value ? parseFloat(value) : null),
        },
    })
    latitude?: number;

    @Column('decimal', {
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: {
            to: (value?: number) => value,
            from: (value?: string) => (value ? parseFloat(value) : null),
        },
    })
    longitude?: number;

    @Column({ type: 'timestamptz', nullable: true })
    lastLocationUpdatedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}


