import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Address } from "./address-entity";

@Entity({ name: "user" })
export class User {
  @PrimaryGeneratedColumn({ type: "smallint" })
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  profession: string;

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];
}
