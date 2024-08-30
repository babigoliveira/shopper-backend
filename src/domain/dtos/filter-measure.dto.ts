import { ApiProperty } from '@nestjs/swagger';
import { MEASURE_TYPES, MeasureType } from './image-upload.dto';

export class FilterMeasureRequestDto {
  @ApiProperty({ enum: MEASURE_TYPES, required: false })
  measure_type?: MeasureType;
}

class MeasureResponseDto {
  @ApiProperty()
  measure_uuid: string;

  @ApiProperty()
  measure_datetime: Date;

  @ApiProperty()
  measure_type: MeasureType;

  @ApiProperty()
  has_confirmed: boolean;

  @ApiProperty()
  image_url: string;
}

export class FilterMeasureResponseDto {
  @ApiProperty()
  customer_code: string;

  @ApiProperty()
  measures: Array<MeasureResponseDto>;
}
