import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Measure } from '../../domain/schemas/measure.schema';
import { CreateMeasureDto } from './create-measure.dto';

@Injectable()
export class MeasureService {
  constructor(
    @InjectModel(Measure.name) private measureModel: Model<Measure>,
  ) {}

  async create(dto: CreateMeasureDto): Promise<Measure> {
    const createdMeasure = new this.measureModel(dto);
    const measure = await createdMeasure.save();
    return measure;
  }
}
