import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ImageUploadRequestDto,
  ImageUploadResponseDto,
} from './domain/dtos/image-upload.dto';
import { ZodValidationPipe } from './zod-validation-pipe';
import { createImageUploadRequestDtoSchema } from './domain/validators/image-upload-validators';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({
    type: ImageUploadResponseDto,
  })
  @UsePipes(new ZodValidationPipe(createImageUploadRequestDtoSchema))
  uploadImage(@Body() body: ImageUploadRequestDto): ImageUploadResponseDto {
    return {
      image_url: '',
      measure_uuid: '',
      measure_value: 0,
    };
  }
}
