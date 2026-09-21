import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true, nullable: true })
    email?: string;

    @Column({ select: false, nullable: true })
    password?: string;

    @Column({unique: true})
    phoneNumber: string;

    @Column({type: 'enum', enum: Role})
    role: Role

};