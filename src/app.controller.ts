import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ImageUploadRequestDto,
  ImageUploadResponseDto,
} from './domain/dtos/image-upload.dto';
import { ZodValidationPipe } from './zod-validation-pipe';
import { createImageUploadRequestDtoSchema } from './domain/validators/image-upload-validators';
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from './domain/dtos/error-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
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
    const { uploadResult, queryResult } =
      await this.appService.uploadImageAndQueryGeminiReading(body);

    return {
      image_url: uploadResult.file.uri,
      measure_uuid: '',
      measure_value: parseFloat(queryResult.response.text()),
    };
  }
}
