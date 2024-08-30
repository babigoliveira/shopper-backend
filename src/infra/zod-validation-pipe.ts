import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      let error_description = '';

      if (error.name === 'ZodError') {
        const zodError = error as ZodError;
        error_description = zodError.issues[0].message;
      }

      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description,
      });
    }
  }
}
