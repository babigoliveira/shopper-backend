import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';
import { MONGODB_CONNECTION_URI } from '../src/env';

describe('AppController (e2e)', () => {
  let app: INestApplication;

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

  beforeAll(async () => {
    await mongoose.connect(MONGODB_CONNECTION_URI);
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    const collections = await mongoose.connection.listCollections();

    for (const { name } of collections) {
      await mongoose.connection.collection(name).deleteMany({});
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('uploads image successfully', async () => {
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

    const app = moduleFixture.createNestApplication();
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
});
