// src/app.module.ts
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { NewsModule } from "./news/news.module";
import { PrismaModule } from "./prisma/prisma.module";
import { CrawlerModule } from "./crawler/crawler.module";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from "@nestjs/graphql";
import { CategoryModule } from "./category/category.module";
import { HfModule } from "./hf/hf.module";
import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL || "redis://redis:6379",
          ttl: 0, // default: no ttl; set per-key below
        }),
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      graphiql: true,
    }),
    ScheduleModule.forRoot(), // Enables cron jobs
    NewsModule,
    PrismaModule,
    CrawlerModule,
    CategoryModule,
    HfModule,
  ],
})
export class AppModule {}
