export class ProductDimensionsDto {
  width: number;
  height: number;
  depth: number;
}

export class ProductReviewDto {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export class ProductMetaDto {
  createdAt: string;
  updatedAt: string;
  barcode: string;
  qrCode: string;
}

export class ProductResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  weight: number;
  dimensions: ProductDimensionsDto;
  warrantyInformation: string;
  shippingInformation: string;
  availabilityStatus: string;
  reviews: ProductReviewDto[];
  returnPolicy: string;
  minimumOrderQuantity: number;
  meta: ProductMetaDto;
  images: string[];
  thumbnail: string;
}

export class CategoryResponseDto {
  slug: string;
  name: string;
  url: string;
}

export class ProductListResponseDto {
  products: ProductResponseDto[];
  total: number;
  skip: number;
  limit: number;
}
