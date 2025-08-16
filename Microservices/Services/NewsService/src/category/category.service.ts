import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class CategoryService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  async getFeaturedNewsByCategory(categoryId: number, page: number = 1) {
    if (!categoryId) throw new BadRequestException("categoryId is required");
    const take = 12;
    const currentPage = Math.max(1, Number(page) || 1);
    const skip = (currentPage - 1) * take;
    const where = { categoryId };

    const key = `news:category:${categoryId}:page:${currentPage}`;
    const cached = await this.cache.get<{ items: any[]; totalPages: number }>(
      key
    );
    if (cached) return cached;

    const [totalCount, items] = await this.prisma.$transaction([
      this.prisma.news.count({ where }),
      this.prisma.news.findMany({
        where,
        orderBy: { publishedDate: "desc" },
        skip,
        take,
        include: { category: true }, // include category details
      }),
    ]);

    const payLoad = { items, totalCount: Math.ceil(totalCount / take) };
    await this.cache.set(key, payLoad, 60); // TTL in seconds
    return payLoad;
  }

  async getAllCategories() {
    const key = "categories:all";
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const rows = await this.prisma.category.findMany();
    await this.cache.set(key, rows, 600); // 10 min
    return rows;
  }
}
