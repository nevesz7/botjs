import { Entity, Column } from "typeorm";

@Entity({ name: "return_user" })
export class return_user {
  @Column()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  date_of_birth: Date;

  @Column({ nullable: true })
  profession: string;
}
