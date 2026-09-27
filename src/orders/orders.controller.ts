import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/jwt-payload.interface.js';
import { CartResponseDto } from './dto/cart-response.dto.js';
import { OrdersService } from './orders.service.js';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: [CartResponseDto] })
  findMine(@CurrentUser() user: JwtPayload) {
    return this.ordersService.findMine(user.sub);
  }
}
