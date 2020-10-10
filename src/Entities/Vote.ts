import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  voteId!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.vote)
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, (post) => post.vote)
  post!: Post;

  @Field()
  @Column()
  up!: boolean;
}
