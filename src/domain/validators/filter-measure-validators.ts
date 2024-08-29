import { z } from 'zod';
import { MEASURE_TYPES } from '../dtos/image-upload.dto';

export const filterMeasureRequestDtoSchema = z
  .object({
    measure_type: z.enum(MEASURE_TYPES, {
      invalid_type_error: 'Tipo de medição não permitida',
    }),
  })
  .required();

export type FilterMeasureRequestDtoSchema = z.infer<
  typeof filterMeasureRequestDtoSchema
>;
