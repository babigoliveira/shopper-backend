import { Injectable } from '@nestjs/common';
import {
  GoogleAIFileManager,
  UploadFileResponse,
} from '@google/generative-ai/server';
import * as path from 'node:path';
import { IMAGE_EXTENSIONS_TO_MIME_TYPE } from './constants';
import {
  GenerateContentResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

type GeminiQuery = {
  mimeType: string;
  fileUri: string;
  query: string;
};

@Injectable()
export class GeminiService {
  private fileManager: GoogleAIFileManager;
  private model: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    this.fileManager = new GoogleAIFileManager(GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
  }

  async uploadImage(filePath: string): Promise<UploadFileResponse> {
    const extension = path.extname(filePath);
    const mimeType = IMAGE_EXTENSIONS_TO_MIME_TYPE.get(extension);

    if (mimeType === undefined) {
      throw new Error(`Unsupported mimeType for file '${filePath}'`);
    }

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
