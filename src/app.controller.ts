import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { v4 as uuidV4 } from 'uuid';

import { AppService } from './app.service';
import {
  ImageUploadRequestDto,
  ImageUploadResponseDto,
} from './domain/dtos/image-upload.dto';
import { ZodValidationPipe } from './zod-validation-pipe';
import { createImageUploadRequestDtoSchema } from './domain/validators/image-upload-validators';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './domain/dtos/error-response.dto';
import { ConfirmMeasureRequestDto } from './domain/dtos/confirm-measure.dto';
import { confirmMeasureRequestDtoSchema } from './domain/validators/confirm-measure-validators';
import { getExceptionFilters } from './infra/exception-filters';
import {
  FilterMeasureRequestDto,
  FilterMeasureResponseDto,
} from './domain/dtos/filter-measure.dto';
import { MeasuresNotFoundError } from './domain/errors';
import { filterMeasureRequestDtoSchema } from './domain/validators/filter-measure-validators';

const exceptionFilters = getExceptionFilters();

@Controller()
@UseFilters(...exceptionFilters)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/upload')
  @HttpCode(200)
  @ApiOkResponse({
    type: ImageUploadResponseDto,
  })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    example: {
      error_code: 'INVALID_DATA',
      error_description: 'Invalid base64 image string',
    } satisfies ErrorResponseDto,
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    example: {
      error_code: 'DOUBLE_REPORT',
      error_description: 'Leitura do mês já realizada',
    } satisfies ErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(createImageUploadRequestDtoSchema))
  async uploadImage(
    @Body() body: ImageUploadRequestDto,
  ): Promise<ImageUploadResponseDto> {
    const { image_url, measure_uuid, measure_value } =
      await this.appService.uploadImageAndQueryGeminiReading(body);

    return {
      image_url,
      measure_uuid,
      measure_value,
    };
  }

  @Patch('/confirm')
  @HttpCode(200)
  @ApiOkResponse({
    example: { success: true },
  })
  @ApiConflictResponse({
    example: {
      error_code: 'CONFIRMATION_DUPLICATE',
      error_description:
        'Leitura do mês já realizada 4b86a883-ec6c-4501-8fd5-621ff870aae8',
    } satisfies ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    example: {
      error_code: 'MEASURE_NOT_FOUND',
      error_description:
        'Leitura do mês não encontrada 4b86a883-ec6c-4501-8fd5-621ff870aae8',
    } satisfies ErrorResponseDto,
  })
  @UsePipes(new ZodValidationPipe(confirmMeasureRequestDtoSchema))
  async confirmMeasure(@Body() confirmDto: ConfirmMeasureRequestDto) {
    await this.appService.confirmMeasure(confirmDto);

    return {
      success: true,
    };
  }

  @Get(':customer_code/list')
  @ApiOkResponse({
    type: FilterMeasureResponseDto,
    example: {
      customer_code: 'string',
      measures: [
        {
          measure_type: 'WATER',
          measure_datetime: new Date(),
          measure_uuid: uuidV4().toString(),
          image_url: 'https://example.com',
          has_confirmed: false,
        },
      ],
    } satisfies FilterMeasureResponseDto,
  })
  @ApiNotFoundResponse({
    example: {
      error_code: 'MEASURES_NOT_FOUND',
      error_description: 'Nenhuma leitura encontrada',
    } satisfies ErrorResponseDto,
  })
  @ApiBadRequestResponse({
    example: {
      error_code: 'INVALID_TYPE',
      error_description: 'Tipo de medição não permitida',
    } satisfies ErrorResponseDto,
  })
  async filterMeasures(
    @Param('customer_code') customer_code: string,
    @Query(new ZodValidationPipe(filterMeasureRequestDtoSchema))
    filter: FilterMeasureRequestDto,
  ): Promise<FilterMeasureResponseDto> {
    const measures = await this.appService.filterMeasures(
      customer_code,
      filter.measure_type,
    );

    if (measures.length === 0) {
      throw new MeasuresNotFoundError();
    }

    return {
      customer_code,
      measures: measures.map((m) => ({
        measure_uuid: m.measure_uuid,
        measure_datetime: m.measure_datetime,
        measure_type: m.measure_type,
        has_confirmed: m.validated,
        image_url: m.image_url,
      })),
    };
  }
}
