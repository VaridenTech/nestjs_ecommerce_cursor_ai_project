import { IsInt, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsInt()
  @Min(0)
  skip: number = 0;

  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
