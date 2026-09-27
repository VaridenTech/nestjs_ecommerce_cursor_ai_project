import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toCartResponse } from './cart.mapper.js';
import { AddCartDto } from './dto/add-cart.dto.js';
import { CartResponseDto } from './dto/cart-response.dto.js';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: AddCartDto): Promise<CartResponseDto> {
    const order = await this.prisma.$transaction(async (tx) => {
      const ids = dto.products.map((product) => product.id);
      const products = await tx.product.findMany({ where: { id: { in: ids } } });
      const productById = new Map(products.map((product) => [product.id, product]));

      const items = dto.products.map(({ id, quantity }) => {
        const product = productById.get(id);
        if (!product) {
          throw new NotFoundException(`Product ${id} not found`);
        }
        const total = round2(product.price * quantity);
        const discountedPrice = round2(total * (1 - (product.discountPercentage ?? 0) / 100));
        return {
          productId: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          discountPercentage: product.discountPercentage,
          quantity,
          total,
          discountedPrice,
        };
      });

      return tx.order.create({
        data: {
          userId: dto.userId,
          address: dto.address.address,
          email: dto.address.email,
          phone: dto.address.phone,
          total: round2(items.reduce((sum, item) => sum + item.total, 0)),
          discountedTotal: round2(items.reduce((sum, item) => sum + item.discountedPrice, 0)),
          totalProducts: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          items: { create: items },
        },
        include: { items: { orderBy: { id: 'asc' } } },
      });
    });

    return toCartResponse(order);
  }

  async findMine(userId: number): Promise<CartResponseDto[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: { items: { orderBy: { id: 'asc' } } },
    });

    return orders.map(toCartResponse);
  }
}
