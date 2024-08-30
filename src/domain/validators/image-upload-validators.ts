// eslint-disable-next-line @typescript-eslint/no-require-imports
const isBase64 = require('is-base64');

import { z } from 'zod';
import { MEASURE_TYPES } from '../dtos/image-upload.dto';

export const createImageUploadRequestDtoSchema = z
  .object({
    image: z
      .string()
      .refine(
        (imageStr) =>
          isBase64(imageStr, { allowMime: true, allowEmpty: false }),
        {
          message: 'Invalid base64 image string',
        },
      ),
    customer_code: z.string(),
    measure_datetime: z.coerce.date(),
    measure_type: z.enum(MEASURE_TYPES),
  })
  .required();

export type CreateImageUploadRequestDtoSchema = z.infer<
  typeof createImageUploadRequestDtoSchema
>;
