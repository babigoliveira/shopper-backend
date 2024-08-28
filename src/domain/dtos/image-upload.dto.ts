import { ApiProperty } from '@nestjs/swagger';
import { MEASURE_IMAGE_BASE_64_EXAMPLE } from '../../constants';

export const MEASURE_TYPES = ['WATER', 'GAS'] as const;

export class ImageUploadRequestDto {
  @ApiProperty() customer_code: string;
  @ApiProperty({ example: new Date().toISOString() }) measure_datetime: Date;

  @ApiProperty({ enum: MEASURE_TYPES })
  measure_type: (typeof MEASURE_TYPES)[number];

  @ApiProperty({ example: MEASURE_IMAGE_BASE_64_EXAMPLE }) image: string;
}

export class ImageUploadResponseDto {
  @ApiProperty() image_url: string;
  @ApiProperty() measure_value: number;
  @ApiProperty() measure_uuid: string;
}
