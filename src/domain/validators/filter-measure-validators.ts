import { z } from 'zod';
import { MEASURE_TYPES } from '../dtos/image-upload.dto';

export const filterMeasureRequestDtoSchema = z
  .object({
    measure_type: z
      .enum(MEASURE_TYPES, {
        message: 'Tipo de medição não permitida',
      })
      .optional(),
  })
  .describe('Measure filter with optional type');

export type FilterMeasureRequestDtoSchema = z.infer<
  typeof filterMeasureRequestDtoSchema
>;
