import { v4 as uuidv4 } from 'uuid';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type MeasureDocument = HydratedDocument<Measure>;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Measure {
  @Prop()
  image_url: string;

  @Prop()
  measure_value: number;

  @Prop({ type: mongoose.Schema.Types.UUID, default: uuidv4, index: true })
  measure_uuid: string;

  @Prop({ index: true })
  measure_datetime: Date;

  @Prop({ default: false })
  validated: boolean;
}

export const MeasureSchema = SchemaFactory.createForClass(Measure);
