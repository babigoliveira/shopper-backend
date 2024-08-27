import { ApiProperty } from '@nestjs/swagger';
import { RECT_IMAGE_BASE_64 } from '../../constants';

export const MEASURE_TYPES = ['WATER', 'GAS'] as const;

export class ImageUploadRequestDto {
  @ApiProperty({ example: RECT_IMAGE_BASE_64 }) image: string;
  @ApiProperty() customer_code: string;
  @ApiProperty({ example: new Date().toISOString() }) measure_datetime: Date;

  @ApiProperty({ enum: MEASURE_TYPES })
  measure_type: (typeof MEASURE_TYPES)[number];
}

export class ImageUploadResponseDto {
  @ApiProperty() image_url: string;
  @ApiProperty() measure_value: number;
  @ApiProperty() measure_uuid: string;
}
