import "reflect-metadata";
import { Entity, Column } from "typeorm";

@Entity({ name: "returnUser" })
export class ReturnUser {
  @Column()
  id: number;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    length: 50,
  })
  email: string;

  @Column()
  age: number;

  @Column({
    nullable: true,
  })
  profession: string;
}
