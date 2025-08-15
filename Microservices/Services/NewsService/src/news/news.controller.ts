import { Controller, Get, Post, Body, Param, Inject } from "@nestjs/common";
import { NewsService } from "./news.service";
import { Prisma } from "@prisma/client";
import type { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Controller("news")
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  @Post()
  create(@Body() data: Prisma.NewsCreateInput) {
    return this.newsService.create(data);
  }

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get("cache-test")
  async cacheTest() {
    await this.cache.set("test:key", "Hello Cache", 60); // 60 seconds TTL
    const value = await this.cache.get("test:key");
    return { cachedValue: value };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.newsService.findOne(+id);
  }
}
