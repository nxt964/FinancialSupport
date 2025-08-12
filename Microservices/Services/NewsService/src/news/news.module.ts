import { Module } from "@nestjs/common";
import { NewsService } from "./news.service";
import { NewsController } from "./news.controller";
import { PrismaModule } from "src/prisma/prisma.module";
import { NewsResolver } from "./news.resolver";

@Module({
  controllers: [NewsController],
  providers: [NewsService, NewsResolver],
  imports: [PrismaModule],
})
export class NewsModule {}
