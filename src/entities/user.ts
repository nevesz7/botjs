import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "user" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  static findByName(name: string) {
    return this.createQueryBuilder("user")
      .where("user.name = :name", { name })
      .getOne();
  }
}
