import { Controller, Post, Query } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawl')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post()
  async crawl(@Query('page') page?: number) {
    const safePage = page ?? 1;
    await this.crawlerService.getNews(safePage);
    return { message: '✅ Crawl complete' };
  }
}
