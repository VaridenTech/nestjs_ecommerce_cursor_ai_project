import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import { toProductResponse } from './product.mapper.js';
import { ProductResponseDto } from './dto/product-response.dto.js';

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

  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { orderBy: { id: 'asc' } } },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return toProductResponse(product);
  }
}
