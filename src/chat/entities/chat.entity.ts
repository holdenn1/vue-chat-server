import { User } from "src/user/entities/user.entity";
import { Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => User, (user) => user.chats)
  users: User[]
}
