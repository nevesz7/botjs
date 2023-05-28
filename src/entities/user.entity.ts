import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

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
}
