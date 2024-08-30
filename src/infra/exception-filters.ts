import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import {
  DuplicatedMeasureAttemptError,
  MeasureAlreadyValidatedError,
  MeasureNotFoundError,
  MeasuresNotFoundError,
  UnsupportedImageType,
} from '../domain/errors';

export const getExceptionFilters = (): (new (
  ...args: unknown[]
) => ExceptionFilter)[] => [
  registerExceptionFilter(
    MeasureAlreadyValidatedError,
    409,
    'CONFIRMATION_DUPLICATE',
  ),

  registerExceptionFilter(MeasureNotFoundError, 404, 'MEASURE_NOT_FOUND'),

  registerExceptionFilter(DuplicatedMeasureAttemptError, 409, 'DOUBLE_REPORT'),

  registerExceptionFilter(MeasuresNotFoundError, 404, 'MEASURES_NOT_FOUND'),

  registerExceptionFilter(UnsupportedImageType, 400, 'UNSUPPORTED_IMAGE_TYPE'),
];

const registerExceptionFilter = (
  exception: new (...args: unknown[]) => Error,
  httpStatus: number,
  errorCode: string,
): new (...args: unknown[]) => ExceptionFilter => {
  @Catch(exception)
  class DomainExceptionFilter implements ExceptionFilter {
    public static readonly GENERATED_NAME = `${exception.name}Filter`;

    catch(exception: Error, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      response.status(httpStatus).json({
        error_code: errorCode,
        error_description: exception.message,
      });
    }
  }

  return DomainExceptionFilter;
};
