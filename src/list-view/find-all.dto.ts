import { ApiProperty } from '@nestjs/swagger';

export class FindAllDto<T> {
  @ApiProperty()
  rows: T[];

  @ApiProperty()
  count: number;
}
