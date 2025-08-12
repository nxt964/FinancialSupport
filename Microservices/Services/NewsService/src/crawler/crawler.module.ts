import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { NewsService } from 'src/news/news.service';

@Module({
  controllers: [CrawlerController],
  providers: [CrawlerService, NewsService],
})
export class CrawlerModule {}
