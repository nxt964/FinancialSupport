import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  private async invalidateAfterWrite(categoryId: number | null) {
    await Promise.all(
      [1, 2, 3, 4, 5].map((page) => this.cache.del(`news:page:${page}`))
    );

    // delete category pages if we know which category it belongs to
    if (categoryId) {
      await Promise.all(
        [1, 2, 3, 4, 5].map((page) =>
          this.cache.del(`news:category:${categoryId}:page:${page}`)
        )
      );
    }

    await this.cache.del("categories:all");
  }

  async create(data: Prisma.NewsCreateInput) {
    const created = await this.prisma.news.create({
      data,
      include: { category: true }, // ensure we have category.id
    });

    await this.invalidateAfterWrite(created.category?.id ?? null);
    return created;
  }

  findAll() {
    return this.prisma.news.findMany({ orderBy: { publishedDate: "desc" } });
  }

  async findOne(id: number) {
    const key = `news:one:${id}`;
    const hit = await this.cache.get<any>(key);
    if (hit) {
      return hit;
    }

    const row = await this.prisma.news.findUnique({
      where: { id },
      include: { category: true },
    });
    if (row) await this.cache.set(key, row, 120); // 2 min

    return row;
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

    const key = `news:featured:page:${page}`;
    const cached = await this.cache.get<{ items: any[]; totalPages: number }>(
      key
    );
    if (cached) {
      return cached;
    }

    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.news.count(),
      this.prisma.news.findMany({
        skip,
        take: limit,
        orderBy: { publishedDate: "desc" },
        include: { category: true },
      }),
    ]);

    const payload = { items, totalCount: Math.ceil(totalCount / limit) };
    await this.cache.set(key, payload, 60); // 1 min
    return payload;
  }
}
