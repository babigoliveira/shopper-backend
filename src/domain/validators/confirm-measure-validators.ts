import { z } from 'zod';

export const confirmMeasureRequestDtoSchema = z
  .object({
    measure_uuid: z.string().uuid(),
    confirmed_value: z.number(),
  })
  .required();

export type ConfirmMeasureRequestDtoSchema = z.infer<
  typeof confirmMeasureRequestDtoSchema
>;
