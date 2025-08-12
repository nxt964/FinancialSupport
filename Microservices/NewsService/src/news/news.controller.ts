import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NewsService } from './news.service';
import { Prisma } from '@prisma/client';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  create(@Body() data: Prisma.NewsCreateInput) {
    return this.newsService.create(data);
  }

  @Get()
  findAll() {
    return this.newsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(+id);
  }
}
