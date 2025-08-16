import { Module } from "@nestjs/common";
import { CrawlerService } from "./crawler.service";
import { CrawlerController } from "./crawler.controller";
import { HfModule } from "src/hf/hf.module";
import { NewsModule } from "src/news/news.module";

@Module({
  imports: [HfModule, NewsModule],
  controllers: [CrawlerController],
  providers: [CrawlerService],
})
export class CrawlerModule {}
