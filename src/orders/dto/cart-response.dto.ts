export class CartProductResponseDto {
  id: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
  discountPercentage?: number;
  discountedPrice: number;
  thumbnail: string;
}

export class CartResponseDto {
  id: number;
  userId: number;
  products: CartProductResponseDto[];
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}
