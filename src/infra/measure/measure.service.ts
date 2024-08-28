import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Measure } from '../../domain/schemas/measure.schema';
import { CreateMeasureDto } from './create-measure.dto';
import {
  MeasureAlreadyValidatedError,
  MeasureNotFoundError,
} from '../../domain/errors';

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

  async confirm(measureUuid: string, confirmedValue: number): Promise<Measure> {
    // FIXME: convert this implementation to be atomic

    const measure = await this.measureModel.findOne({
      measure_uuid: measureUuid,
    });

    if (measure == null) {
      throw new MeasureNotFoundError(measureUuid);
    }

    if (measure.validated) {
      throw new MeasureAlreadyValidatedError(measureUuid);
    }

    measure.validated = true;
    measure.measure_value = confirmedValue;

    const saved = await measure.save();

    return saved;
  }
}
