import { Body, Controller, Post } from '@nestjs/common';
import { AddCartDto } from './dto/add-cart.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('carts')
export class CartsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('add')
  create(@Body() dto: AddCartDto) {
    return this.ordersService.create(dto);
  }
}
