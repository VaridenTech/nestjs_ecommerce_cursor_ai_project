import { Body, Controller, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AddCartDto } from './dto/add-cart.dto.js';
import { CartResponseDto } from './dto/cart-response.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('carts')
@Controller('carts')
export class CartsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('add')
  @ApiCreatedResponse({ type: CartResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  create(@Body() dto: AddCartDto) {
    return this.ordersService.create(dto);
  }
}
