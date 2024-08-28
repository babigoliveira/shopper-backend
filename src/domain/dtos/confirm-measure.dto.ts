import { ApiProperty } from '@nestjs/swagger';

export class ConfirmMeasureRequestDto {
  @ApiProperty() measure_uuid: string;
  @ApiProperty() confirmed_value: number;
}
