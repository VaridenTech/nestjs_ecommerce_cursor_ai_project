import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import {
  CategoryResponseDto,
  ProductListResponseDto,
  ProductResponseDto,
} from './dto/product-response.dto.js';
import { ProductsService } from './products.service.js';

@Public()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOkResponse({ type: [CategoryResponseDto] })
  findCategories() {
    return this.productsService.findCategories();
  }

  @Get('category/:slug')
  @ApiOkResponse({ type: ProductListResponseDto })
  findByCategory(@Param('slug') slug: string, @Query() query: PaginationQueryDto) {
    return this.productsService.findByCategory(slug, query);
  }

  @Get()
  @ApiOkResponse({ type: ProductListResponseDto })
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductResponseDto })
  @ApiNotFoundResponse({ description: "Product 9999 not found" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }
}
