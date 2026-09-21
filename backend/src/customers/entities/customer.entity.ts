import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Customer {

    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User)
    @JoinColumn()
    user: User

}