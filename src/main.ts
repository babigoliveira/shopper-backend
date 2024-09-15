import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PORT } from './env';
import { json } from 'express';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, {});
  app.use(json({ limit: '5mb' }));
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Desafio BackEnd Shopper')
    .setDescription(
      '1ª etapa do desafio para a vaga de desenvolvedor FullStack Jr. da Shopper',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT);
};

bootstrap();
