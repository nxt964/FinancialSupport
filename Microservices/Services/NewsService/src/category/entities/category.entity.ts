import { ObjectType, Field, Int } from "@nestjs/graphql";
import { News } from "src/news/entities/news.entity";

@ObjectType()
export class Category {
  @Field(() => Int, { description: "Category ID" })
  id: number;

  @Field(() => String, { description: "Category Name" })
  name: string;

  @Field(() => String, { description: "Category Slug" })
  slug: string;

  @Field(() => [News], {
    description: "List of news articles in this category",
  })
  news: News[];
}
