import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const PORT = parseInt(process.env.PORT ?? '3000');

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Desafio BackEnd Shopper')
    .setDescription(
      '1ª etapa do desafio para a vaga de desenvolvedor FullStack Jr. da Shopper',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
};

bootstrap();
