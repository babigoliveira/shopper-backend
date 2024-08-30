import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileSystemService } from './file-system.service';
import { GeminiService } from './gemini.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MeasureModule } from './measure/measure.module';
import { GEMINI_API_KEY, MONGODB_CONNECTION_URI } from './env';

const googleAIFileManagerFactory = {
  provide: 'GoogleAIFileManager',
  useFactory: () => new GoogleAIFileManager(GEMINI_API_KEY),
};

const generativeModelFactory = {
  provide: 'GenerativeModel',
  useFactory: () => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
  },
};

@Module({
  imports: [MongooseModule.forRoot(MONGODB_CONNECTION_URI), MeasureModule],
  controllers: [AppController],
  providers: [
    AppService,
    FileSystemService,
    GeminiService,
    googleAIFileManagerFactory,
    generativeModelFactory,
  ],
})
export class AppModule {}
