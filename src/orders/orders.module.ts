import { Module } from '@nestjs/common';
import { CartsController } from './carts.controller.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [CartsController, OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
