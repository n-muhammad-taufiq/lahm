import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { DeliveryPartner } from "./entities/delivery-partner.entity";
import { RegisterDeliveryPartnerDto } from "./dtos/register-delivery-partner-dto";
import { UpdateDeliveryPartnerDto } from "./dtos/update-delivery-partner-dto";
import { User } from "src/users/entities/user.entity";
import { Role } from "src/users/enums/role.enum";
import { UsersService } from "src/users/users.service";

@Injectable()
export class DeliveryPartnersService {
    constructor(
        @InjectRepository(DeliveryPartner)
        private readonly deliveryPartnerRepository: Repository<DeliveryPartner>,
        private readonly usersService: UsersService,
        private readonly dataSource: DataSource,
    ) { }

    async register(registerDeliveryPartnerDto: RegisterDeliveryPartnerDto) {
        const {
            name,
            email,
            phoneNumber,
            password,
            dateOfBirth,
            addressLine,
            city,
            state,
            pinCode,
            vehicleType,
            vehicleRegistrationNumber,
            drivingLicenseNumber,
            drivingLicensePhotoUrl,
            vehicleRcPhotoUrl,
            accountHolderName,
            bankAccountNumber,
            ifsc,
            bankName,
            preferredDeliveryArea,
            workingHours,
            maxDeliveryRadiusKm,
        } = registerDeliveryPartnerDto;

        const existingUser = email
            ? await this.usersService.findOne(email, phoneNumber)
            : await this.usersService.findOneByPhone(phoneNumber);

        if (existingUser) {
            throw new ConflictException('User with this email or phone number already exists');
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const { savedUser, savedDeliveryPartner } = await this.dataSource.transaction(async (manager) => {
            const savedUser = await manager.save(User, {
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                role: Role.DELIVERY_PARTNER,
            });

            const savedDeliveryPartner = await manager.save(DeliveryPartner, {
                user: savedUser,
                dateOfBirth,
                addressLine,
                city,
                state,
                pinCode,
                vehicleType,
                vehicleRegistrationNumber,
                drivingLicenseNumber,
                drivingLicensePhotoUrl,
                vehicleRcPhotoUrl,
                accountHolderName,
                bankAccountNumber,
                ifsc,
                bankName,
                preferredDeliveryArea,
                workingHours,
                maxDeliveryRadiusKm,
            });

            return { savedUser, savedDeliveryPartner };
        });

        const { password: savedUserPassword, ...userWithoutPassword } = savedUser;

        return { user: userWithoutPassword, deliveryPartner: savedDeliveryPartner };
    }

    async findByUserId(userId: number): Promise<DeliveryPartner> {
        const deliveryPartner = await this.deliveryPartnerRepository.findOne({
            where: { user: { id: userId } },
            relations: { user: true },
        });

        if (!deliveryPartner) {
            throw new NotFoundException(`Delivery partner for user #${userId} not found`);
        }

        return deliveryPartner;
    }

    async updateByUserId(userId: number, updateDto: UpdateDeliveryPartnerDto): Promise<DeliveryPartner> {
        const deliveryPartner = await this.findByUserId(userId);
        Object.assign(deliveryPartner, updateDto);
        return this.deliveryPartnerRepository.save(deliveryPartner);
    }
}