import { Resolver, Query, Args, Int } from "@nestjs/graphql";
import { News } from "./entities/news.entity";
import { NewsService } from "./news.service";
import { PaginatedNews } from "./dto/paginated-news.type";

@Resolver(() => News)
export class NewsResolver {
  constructor(private readonly newsService: NewsService) {}

  // Featured news: only fetch what you need in the query selection
  // @Query(() => [News])
  // featuredNews(
  //   @Args("page", { type: () => Int, nullable: true, defaultValue: 1 })
  //   page: number
  // ) {
  //   // You can still pull full records here; the client selects fields
  //   return this.newsService.findFeatured(page);
  // }

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
