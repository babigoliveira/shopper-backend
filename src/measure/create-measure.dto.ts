import { MeasureType } from '../domain/dtos/image-upload.dto';

export class CreateMeasureDto {
  customer_code: string;
  image_url: string;
  measure_value: number;
  measure_datetime: Date;
  measure_type: MeasureType;
}
