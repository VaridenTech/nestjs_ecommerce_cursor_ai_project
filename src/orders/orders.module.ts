import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [CartsController],
  providers: [OrdersService],
})
export class OrdersModule {}
