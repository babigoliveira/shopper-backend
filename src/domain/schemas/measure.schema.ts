import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { format } from 'date-fns';
import { MEASURE_TYPES } from '../dtos/image-upload.dto';

export type MeasureDocument = HydratedDocument<Measure>;

export const MEASURE_YEAR_MONTH_FORMAT = 'yyyy-MM';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Measure {
  @Prop({ index: true })
  customer_code: string;

  @Prop()
  image_url: string;

  @Prop()
  measure_value: number;

  @Prop({ type: mongoose.Schema.Types.UUID, default: uuidv4, index: true })
  measure_uuid: string;

  @Prop()
  measure_datetime: Date;

  @Prop({
    index: true,
    default() {
      return format(this.measure_datetime, MEASURE_YEAR_MONTH_FORMAT);
    },
  })
  measure_year_month: string;

  @Prop({ default: false })
  validated: boolean;

  @Prop({ type: mongoose.Schema.Types.String, enum: MEASURE_TYPES })
  measure_type: (typeof MEASURE_TYPES)[number];
}

export const MeasureSchema = SchemaFactory.createForClass(Measure);

MeasureSchema.index(
  { customer_code: 1, measure_type: 1, measure_year_month: 1 },
  { unique: true },
);
