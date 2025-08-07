// src/app.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NewsModule } from './news/news.module';
import { PrismaModule } from './prisma/prisma.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enables cron jobs
    NewsModule,
    PrismaModule,
    CrawlerModule,
  ],
})
export class AppModule {}
