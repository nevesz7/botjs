import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: "address" })
export class Address {
  @PrimaryColumn()
  CEP: string;

  @Column()
  street: string;

  @Column()
  streetNumber: number;

  @Column({ nullable: true })
  complement: string;

  @Column()
  neighborhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @ManyToOne(() => User, (user) => user.address, {
    cascade: true,
    onDelete: "CASCADE",
  })
  user: User;
}
