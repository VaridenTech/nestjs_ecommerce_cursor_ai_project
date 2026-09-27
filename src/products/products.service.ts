import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';

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
}
