import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileSystemService } from './file-system.service';
import { GeminiService } from './gemini.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FileSystemService, GeminiService],
})
export class AppModule {}
