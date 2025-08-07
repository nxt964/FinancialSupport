import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.NewsCreateInput) {
    return this.prisma.news.create({ data });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { publishedDate: 'desc' } });
  }

  findOne(id: number) {
    return this.prisma.news.findUnique({ where: { id } });
  }
}
