import { Injectable } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { GeminiService } from './gemini.service';
import { ImageUploadRequestDto } from './domain/dtos/image-upload.dto';
import {
  IMAGE_MIME_TYPES_TO_EXTENSION,
  MIME_TYPES_SIGNATURES,
} from './constants';
import { MeasureService } from './infra/measure/measure.service';
import { ConfirmMeasureRequestDto } from './domain/dtos/confirm-measure.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly fsService: FileSystemService,
    private readonly geminiService: GeminiService,
    private readonly measureService: MeasureService,
  ) {}

  async uploadImageAndQueryGeminiReading({
    customer_code,
    image,
    measure_datetime,
  }: ImageUploadRequestDto) {
    const filePath = this.makeFilePath(image, customer_code, measure_datetime);
    this.fsService.store(filePath, image);

    const uploadResponse = await this.geminiService.uploadImage(filePath);

    const result = await this.geminiService.queryImageContent({
      mimeType: uploadResponse.file.mimeType,
      fileUri: uploadResponse.file.uri,
      query:
        'What is the number measured by the reader machine? ' +
        'Only give the number.',
    });

    // TODO: remover imagem após upload

    const measure = await this.measureService.create({
      image_url: uploadResponse.file.uri,
      measure_value: parseFloat(result.response.text()),
      measure_datetime,
    });

    return measure;
  }

  private makeFilePath(
    image: string,
    customerCode: string,
    measureDatetime: Date,
  ) {
    const mimeType = this.getMimeType(image);
    const extension = IMAGE_MIME_TYPES_TO_EXTENSION.get(mimeType);
    const filePath = `./${customerCode}_${measureDatetime.toISOString()}${extension}`;
    return filePath;
  }

  private getMimeType(base64: string): string {
    const matches = base64.match(/^data:(.*?);base64,/);

    if (matches && matches.length > 1) {
      return matches[1];
    }

    for (const [signature, mimeType] of MIME_TYPES_SIGNATURES.entries()) {
      if (base64.startsWith(signature)) {
        return mimeType;
      }
    }

    return '';
  }

  confirmMeasure(confirmDto: ConfirmMeasureRequestDto) {
    return this.measureService.confirm(
      confirmDto.measure_uuid,
      confirmDto.confirmed_value,
    );
  }
}
