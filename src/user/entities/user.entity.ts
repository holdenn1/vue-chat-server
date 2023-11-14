import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'app_user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nickname: string;

  @Column()
  photo: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @ManyToMany(() => Chat, (chat) => chat.users)
  @JoinTable()
  chats: Chat[]
}
