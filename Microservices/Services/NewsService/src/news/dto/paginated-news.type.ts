// src/news/dto/paginated-news.type.ts
import { ObjectType, Field, Int } from "@nestjs/graphql";
import { News } from "../entities/news.entity";

@ObjectType()
export class PaginatedNews {
  @Field(() => [News])
  items: News[];

  @Field(() => Int)
  totalCount: number;
}
