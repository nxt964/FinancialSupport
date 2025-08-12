import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.NewsCreateInput) {
    return this.prisma.news.create({ data });
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { publishedDate: "desc" } });
  }

  findOne(id: number) {
    return this.prisma.news.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  // news.service.ts (Postgres)
  async findRelated(id: number) {
    const rows = await this.prisma.$queryRaw<Array<{ id: number }>>`
    SELECT id FROM "News"
    WHERE id != ${id}
    ORDER BY RANDOM()
    LIMIT 4
  `;
    const ids = rows.map((r) => r.id);
    if (!ids.length) return [];

    const items = await this.prisma.news.findMany({
      where: { id: { in: ids } },
      include: { category: true },
    });

    // preserve random order
    const pos = new Map(ids.map((v, i) => [v, i]));
    items.sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
    return items;
  }

  async findAndCount(page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;

    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.news.count(),
      this.prisma.news.findMany({
        skip,
        take: limit,
        orderBy: { publishedDate: "desc" },
        include: { category: true },
      }),
    ]);

    return { items, totalCount: Math.ceil(totalCount / limit) };
  }

  findFeatured(page: number) {
    const limit = 12;
    const offset = (page - 1) * limit;

    return this.prisma.news.findMany({
      orderBy: { publishedDate: "desc" },
      take: limit,
      skip: offset,
      // Optional: select minimal fields to reduce DB payload
      // select: { id: true, title: true, coverImageUrl: true, publishedDate: true },
    });
  }
}
