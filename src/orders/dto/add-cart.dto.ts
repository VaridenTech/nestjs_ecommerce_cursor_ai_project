import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartProductDto {
  @IsInt()
  @Min(1)
  id: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class AddCartDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CartProductDto)
  products: CartProductDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
