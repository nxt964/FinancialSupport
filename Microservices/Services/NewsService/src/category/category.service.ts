import { Injectable } from "@nestjs/common";
import { Category } from "./entities/category.entity";
import { PrismaService } from "src/prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getFeaturedNewsByCategory(categoryId: number, page: number = 1) {
    if (!categoryId) throw new BadRequestException("categoryId is required");
    const take = 12;
    const currentPage = Math.max(1, Number(page) || 1);
    const skip = (currentPage - 1) * take;

    const where = { categoryId }; // hoặc { category: { id: categoryId } }

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

    return { items, totalCount: Math.ceil(totalCount / take) };
  }
}
