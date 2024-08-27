import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  ImageUploadRequestDto,
  ImageUploadResponseDto,
} from './domain/dtos/image-upload.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('uploads image successfully', () => {
      const body = Object.assign(new ImageUploadRequestDto(), {
        customer_code: 'customer_code',
        image: 'base64',
        measure_datetime: new Date(),
        measure_type: 'GAS',
      } as const satisfies ImageUploadRequestDto);

      const expectedResponse = Object.assign(new ImageUploadResponseDto(), {
        image_url: '',
        measure_uuid: '',
        measure_value: 0,
      } as const satisfies ImageUploadResponseDto);

      expect(appController.uploadImage(body)).toEqual(expectedResponse);
    });
  });
});
