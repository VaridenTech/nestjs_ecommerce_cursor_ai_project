import type { Order, OrderItem } from '../generated/prisma/client.js';
import { CartResponseDto } from './dto/cart-response.dto.js';

export type OrderWithItems = Order & { items: OrderItem[] };

export function toCartResponse(order: OrderWithItems): CartResponseDto {
  return {
    id: order.id,
    userId: order.userId,
    products: order.items.map((item) => ({
      id: item.productId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      ...(item.discountPercentage !== null ? { discountPercentage: item.discountPercentage } : {}),
      discountedPrice: item.discountedPrice,
      thumbnail: item.thumbnail,
    })),
    total: order.total,
    discountedTotal: order.discountedTotal,
    totalProducts: order.totalProducts,
    totalQuantity: order.totalQuantity,
  };
}
