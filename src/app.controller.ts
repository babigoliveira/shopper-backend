import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
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
}
