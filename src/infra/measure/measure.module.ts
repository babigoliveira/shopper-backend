import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Measure, MeasureSchema } from '../../domain/schemas/measure.schema';
import { MeasureService } from './measure.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Measure.name, schema: MeasureSchema }]),
  ],
  providers: [MeasureService],
  exports: [MeasureService],
})
export class MeasureModule {}
