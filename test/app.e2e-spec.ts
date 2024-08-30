import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';
import { MONGODB_CONNECTION_URI } from '../src/env';
import { MeasureService } from '../src/measure/measure.service';
import { ErrorResponseDto } from '../src/domain/dtos/error-response.dto';
import { faker } from '@faker-js/faker';

jest.mock('fs');

const encodedBase64SquareImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAALQAQMAAAD1s0' +
  '8VAAAAA1BMVEX/AAAZ4gk3AAAAh0lEQVR42u3BMQEAAADCoPVPbQlPoAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAB4GsTfAAGc95RKAAAAAElFTkSuQmCC';

const bodySample = {
  image: encodedBase64SquareImage,
  customer_code: 'customer_code',
  measure_datetime: new Date().toISOString(),
  measure_type: 'GAS',
};

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let measureService: MeasureService;

  beforeAll(async () => {
    await mongoose.connect(MONGODB_CONNECTION_URI);
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await app.close();
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.listCollections();

    for (const { name } of collections) {
      await mongoose.connection.collection(name).deleteMany({});
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    measureService = moduleFixture.get(MeasureService);

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('fails to parse image base64', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .send({ ...bodySample, image: 'non base64 string' })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid base64 image string',
      });
  });

  it('fails to parse measure_type', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .send({ ...bodySample, measure_type: 'invalid' })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description:
          "Invalid enum value. Expected 'WATER' | 'GAS', received 'invalid'",
      });
  });

  it('fails to parse measure_datetime', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .send({ ...bodySample, measure_datetime: 'invalid' })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid date',
      });
  });

  it('fails duplicated measure', async () => {
    await app.close();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MeasureService)
      .useValue({
        findMeasure() {
          return 'non null';
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    return request(app.getHttpServer())
      .post('/upload')
      .send(bodySample)
      .expect(409)
      .expect({
        error_code: 'DOUBLE_REPORT',
        error_description: 'Leitura do mês já realizada',
      } as ErrorResponseDto);
  });

  it('uploads image successfully', async () => {
    await app.close();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('GoogleAIFileManager')
      .useValue({
        uploadFile() {
          return Promise.resolve({
            file: { mimeType: '', uri: 'https://example.com' },
          });
        },
      })
      .overrideProvider('GenerativeModel')
      .useValue({
        generateContent() {
          return {
            response: {
              text: () => '1234',
            },
          };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    return request(app.getHttpServer())
      .post('/upload')
      .send(bodySample)
      .expect(200)
      .expect((res) => {
        expect(res.body).toStrictEqual({
          image_url: 'https://example.com',
          measure_uuid: expect.any(String),
          measure_value: 1234,
        });
      });
  });

  it('fails to confirm measure | Invalid uuid', () => {
    return request(app.getHttpServer())
      .patch('/confirm')
      .send({ measure_uuid: 'invalid', confirmed_value: 0 })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid uuid',
      });
  });

  test('measure not found', () => {
    return request(app.getHttpServer())
      .patch('/confirm')
      .send({ measure_uuid: faker.string.uuid(), confirmed_value: 0 })
      .expect(404)
      .expect({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura do mês não encontrada',
      });
  });

  test('duplicated measure', async () => {
    const createdMeasure = await measureService.create({
      customer_code: '123',
      measure_type: 'WATER',
      measure_datetime: new Date(),
      image_url: faker.internet.url(),
      measure_value: 0,
    });

    await measureService.confirm(createdMeasure.measure_uuid, 0);

    return request(app.getHttpServer())
      .patch('/confirm')
      .send({ measure_uuid: createdMeasure.measure_uuid, confirmed_value: 0 })
      .expect(409)
      .expect({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura do mês já realizada',
      });
  });

  it('confirms measure successfully', async () => {
    const createdMeasure = await measureService.create({
      customer_code: '123',
      measure_type: 'WATER',
      measure_datetime: new Date(),
      image_url: faker.internet.url(),
      measure_value: 0,
    });

    await request(app.getHttpServer())
      .patch('/confirm')
      .send({ measure_uuid: createdMeasure.measure_uuid, confirmed_value: 100 })
      .expect(200)
      .expect({ success: true });

    const foundMeasure = await measureService.findMeasure({
      customer_code: '123',
      measure_type: 'WATER',
      measure_datetime: new Date(),
    });

    expect(foundMeasure?.validated).toBe(true);
    expect(foundMeasure?.measure_value).toBe(100);
  });
});
