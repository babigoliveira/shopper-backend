import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileSystemService } from './file-system.service';
import { GeminiService } from './gemini.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MeasureModule } from './infra/measure/measure.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:admin@localhost'),
    MeasureModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileSystemService, GeminiService],
})
export class AppModule {}
