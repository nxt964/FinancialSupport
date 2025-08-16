import { Field, Float, ObjectType } from "@nestjs/graphql";
import { Category } from "src/category/entities/category.entity";

@ObjectType()
export class News {
  @Field() id: number;
  @Field() title: string;
  @Field() url: string;
  @Field({ nullable: true }) coverImageUrl?: string;
  @Field({ nullable: true }) author?: string;
  @Field(() => Date) publishedDate: Date;
  @Field(() => Date) crawledAt: Date;
  @Field({ nullable: true }) sentimentLabel?: string;
  @Field(() => Float, { nullable: true }) sentimentScore?: number;
  @Field({ nullable: true }) content?: string;
  @Field({ nullable: true }) category: Category;
}
