import type { Category, Product, Review } from '../generated/prisma/client.js';
import { ProductResponseDto } from './dto/product-response.dto.js';

export type ProductWithRelations = Product & { category: Category; reviews: Review[] };

export function toProductResponse(product: ProductWithRelations): ProductResponseDto {
  return {
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category.slug,
    price: product.price,
    ...(product.discountPercentage !== null ? { discountPercentage: product.discountPercentage } : {}),
    rating: product.rating,
    stock: product.stock,
    tags: product.tags,
    brand: product.brand,
    sku: product.sku,
    weight: product.weight,
    dimensions: { width: product.width, height: product.height, depth: product.depth },
    warrantyInformation: product.warrantyInformation,
    shippingInformation: product.shippingInformation,
    availabilityStatus: product.availabilityStatus,
    reviews: product.reviews.map((review) => ({
      rating: review.rating,
      comment: review.comment,
      date: review.date.toISOString(),
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
    })),
    returnPolicy: product.returnPolicy,
    minimumOrderQuantity: product.minimumOrderQuantity,
    meta: {
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      barcode: product.barcode,
      qrCode: product.qrCode,
    },
    images: product.images,
    thumbnail: product.thumbnail,
  };
}
