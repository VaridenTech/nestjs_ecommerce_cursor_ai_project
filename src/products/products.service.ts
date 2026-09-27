import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { ProductListResponseDto, ProductResponseDto } from './dto/product-response.dto.js';
import { toProductResponse } from './product.mapper.js';

const productInclude = {
  category: true,
  reviews: { orderBy: { id: 'asc' } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findCategories() {
    const appUrl = this.config.getOrThrow<string>('APP_URL');
    const categories = await this.prisma.category.findMany({ orderBy: { id: 'asc' } });
    return categories.map(({ slug, name }) => ({
      slug,
      name,
      url: `${appUrl}/products/category/${slug}`,
    }));
  }

  findAll(query: PaginationQueryDto) {
    return this.paginate({}, query.skip, query.limit);
  }

  findByCategory(slug: string, query: PaginationQueryDto) {
    return this.paginate({ category: { slug } }, query.skip, query.limit);
  }

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return toProductResponse(product);
  }

  private async paginate(
    where: Prisma.ProductWhereInput,
    skip: number,
    limit: number,
  ): Promise<ProductListResponseDto> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        include: productInclude,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products: rows.map(toProductResponse), total, skip, limit };
  }
}
