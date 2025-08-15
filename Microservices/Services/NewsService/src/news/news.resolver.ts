import { Resolver, Query, Args, Int } from "@nestjs/graphql";
import { News } from "./entities/news.entity";
import { NewsService } from "./news.service";
import { PaginatedNews } from "./dto/paginated-news.type";

@Resolver(() => News)
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  @Query(() => PaginatedNews)
  async featuredNews(
    @Args("page", { type: () => Int, nullable: true }) page = 1
  ) {
    return this.newsService.findAndCount(page);
  }

  @Query(() => News)
  async newsDetails(@Args("id", { type: () => Int }) id: number) {
    return this.newsService.findOne(id);
  }

  @Query(() => [News])
  async relatedNews(@Args("id", { type: () => Int }) id: number) {
    return this.newsService.findRelated(id);
  }

  @Query(() => News, { nullable: true })
  newsById(@Args("id", { type: () => Int }) id: number) {
    return this.newsService.findOne(id);
  }
}
