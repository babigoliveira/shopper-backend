import { Injectable } from '@nestjs/common';
import { FileSystemService } from './file-system.service';
import { GeminiService } from './gemini.service';
import { ImageUploadRequestDto } from './domain/dtos/image-upload.dto';
import { IMAGE_MIME_TYPES_TO_EXTENSION } from './constants';

@Injectable()
export class AppService {
  constructor(
    private readonly fsService: FileSystemService,
    private readonly geminiService: GeminiService,
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

    return {
      uploadResult: uploadResponse,
      queryResult: result,
    };
  }

  private makeFilePath(
    image: string,
    customerCode: string,
    measureDatetime: Date,
  ) {
    const mimeType = this.getMimeType(image);
    const extension = IMAGE_MIME_TYPES_TO_EXTENSION.get(mimeType);
    const filePath = `./${customerCode}_${measureDatetime.toISOString()}.${extension}`;
    return filePath;
  }

  private getMimeType(base64: string): string {
    const matches = base64.match(/^data:(.*?);base64,/);

    if (matches && matches.length > 1) {
      return matches[1];
    }

    return '';
  }
}
