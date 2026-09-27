import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../generated/prisma/enums.js';
import { CartResponseDto } from './dto/cart-response.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOkResponse({ type: [CartResponseDto] })
  findAll() {
    return this.ordersService.findAll();
  }
}
