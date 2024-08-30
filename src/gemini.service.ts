import { Inject, Injectable } from '@nestjs/common';
import {
  GoogleAIFileManager,
  UploadFileResponse,
} from '@google/generative-ai/server';
import * as path from 'node:path';
import { IMAGE_EXTENSIONS_TO_MIME_TYPE } from './constants';
import { GenerateContentResult, GenerativeModel } from '@google/generative-ai';

type GeminiQuery = {
  mimeType: string;
  fileUri: string;
  query: string;
};

@Injectable()
export class GeminiService {
  constructor(
    @Inject('GoogleAIFileManager')
    private readonly fileManager: GoogleAIFileManager,
    @Inject('GenerativeModel')
    private readonly model: GenerativeModel,
  ) {}

  async uploadImage(filePath: string): Promise<UploadFileResponse> {
    const extension = path.extname(filePath);
    const mimeType = IMAGE_EXTENSIONS_TO_MIME_TYPE.get(extension)!;

    const uploadResponse = await this.fileManager.uploadFile(filePath, {
      mimeType,
    });

    return uploadResponse;
  }

  async queryImageContent({
    mimeType,
    fileUri,
    query,
  }: GeminiQuery): Promise<GenerateContentResult> {
    const result = await this.model.generateContent([
      {
        fileData: {
          mimeType,
          fileUri,
        },
      },
      {
        text: query,
      },
    ]);

    return result;
  }
}
