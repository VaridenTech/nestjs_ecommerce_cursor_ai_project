import { Module } from '@nestjs/common';
import { AdminOrdersController } from './admin-orders.controller.js';
import { CartsController } from './carts.controller.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  controllers: [CartsController, OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
