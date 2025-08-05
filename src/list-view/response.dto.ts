import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from './page-meta.dto';
import { FindAllDto } from './find-all.dto';
import { Model } from 'sequelize';

export class ResponseDto<T extends Model> {
  @ApiProperty()
  result: FindAllDto<T>;

  @ApiProperty()
  meta: PageMetaDto;

  constructor(rows: T[], count: number, meta: PageMetaDto) {
    this.result = { rows, count };
    this.meta = meta;
  }
}
