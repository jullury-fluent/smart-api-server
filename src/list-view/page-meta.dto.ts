import { ApiProperty } from '@nestjs/swagger';

import { type QueryOptionsDto } from './query-options.dto';
import z from 'zod';

interface IPageMetaDtoParameters<Z extends z.ZodRawShape> {
  queryOptiosDto: QueryOptionsDto;
  itemCount: number;
}

export class PageMetaDto<Z extends z.ZodRawShape = z.ZodRawShape> {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  readonly count: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ queryOptiosDto, itemCount }: IPageMetaDtoParameters<Z>) {
    this.count = itemCount;
    this.page = queryOptiosDto.page;
    this.pageSize = queryOptiosDto.limit;
    this.pageCount = Math.ceil(this.count / this.pageSize);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
