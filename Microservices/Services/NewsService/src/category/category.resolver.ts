import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { CategoryService } from "./category.service";
import { Category } from "./entities/category.entity";
import { PaginatedNews } from "src/news/dto/paginated-news.type";

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Query(() => PaginatedNews)
  async featuredNewsByCategory(
    @Args("categoryId", { type: () => Int }) categoryId: number,
    @Args("page", { type: () => Int, nullable: true, defaultValue: 1 })
    page?: number
  ) {
    return this.categoryService.getFeaturedNewsByCategory(categoryId, page);
  }
}
