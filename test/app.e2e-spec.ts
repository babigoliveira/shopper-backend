import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import * as mongoose from 'mongoose';
import { MONGODB_CONNECTION_URI } from '../src/env';
import { MeasureService } from '../src/measure/measure.service';
import { ErrorResponseDto } from '../src/domain/dtos/error-response.dto';
import { faker } from '@faker-js/faker';
import { MEASURE_TYPES } from '../src/domain/dtos/image-upload.dto';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
}));

const ENCODED_BASE64_SQUARE_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAALQAQMAAAD1s0' +
  '8VAAAAA1BMVEX/AAAZ4gk3AAAAh0lEQVR42u3BMQEAAADCoPVPbQlPoAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAB4GsTfAAGc95RKAAAAAElFTkSuQmCC';

const ENCODED_BASE64_SQUARE_IMAGE_WITHOUT_MIME_TYPE =
  'iVBORw0KGgoAAAANSUhEUgAABQAAAALQAQMAAAD1s0' +
  '8VAAAAA1BMVEX/AAAZ4gk3AAAAh0lEQVR42u3BMQEAAADCoPVPbQlPoAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' +
  'AAAAAAAAAAAAB4GsTfAAGc95RKAAAAAElFTkSuQmCC';

const ENCODED_BASE64_BMP_IMAGE =
  'Qk1GAAAAAAAAADYAAAAoAAAAAgAAAAIAAAABAAEAAAAAAEABAA' +
  'AAAAAAAAAAAAAAAAAAAAAA//8AAAAA////AAAAAAAAAAD//wAA';

const bodySample = {
  image: ENCODED_BASE64_SQUARE_IMAGE,
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

  it('fails to upload image with unknown mime type signature', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .send({ ...bodySample, image: ENCODED_BASE64_BMP_IMAGE })
      .expect(400)
      .expect({
        error_code: 'UNSUPPORTED_IMAGE_TYPE',
        error_description: "Unsupported image mime type 'unknown'",
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

  it.each([
    ENCODED_BASE64_SQUARE_IMAGE,
    ENCODED_BASE64_SQUARE_IMAGE_WITHOUT_MIME_TYPE,
  ])('uploads image successfully', async (image) => {
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
      .send({ ...bodySample, image })
      .expect(200)
      .expect((res) => {
        expect(res.body).toStrictEqual({
          image_url: 'https://example.com',
          measure_uuid: expect.any(String),
          measure_value: 1234,
        });
      });
  });

  it('should fail to upload invalid', () => {
    return request(app.getHttpServer())
      .patch('/confirm')
      .send({ measure_uuid: 'invalid', confirmed_value: 0 })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid uuid',
      });
  });

  it('fails to upload image with unsupported mime type', () => {
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

  test('filter measure invalid measure type', () => {
    return request(app.getHttpServer())
      .get('/<customer-code>/list')
      .query({
        measure_type: 'INVALID',
      })
      .expect(400)
      .expect({
        error_code: 'INVALID_DATA',
        error_description: 'Tipo de medição não permitida',
      });
  });

  test('zero measures found', () => {
    return request(app.getHttpServer())
      .get('/<customer-code>/list')
      .query({
        measure_type: 'WATER',
      })
      .expect(404)
      .expect({
        error_code: 'MEASURES_NOT_FOUND',
        error_description: 'Nenhuma leitura encontrada',
      });
  });

  it('filters all measures', async () => {
    const createdMeasures = await Promise.all(
      MEASURE_TYPES.map((measureType) =>
        measureService.create({
          customer_code: '123',
          measure_type: measureType,
          measure_datetime: new Date(),
          image_url: faker.internet.url(),
          measure_value: 0,
        }),
      ),
    );

    return request(app.getHttpServer())
      .get('/123/list')
      .expect(200)
      .expect((res) => {
        expect(res.body.measures).toHaveLength(MEASURE_TYPES.length);

        expect(res.body).toStrictEqual({
          customer_code: '123',
          measures: createdMeasures.map((measure) => ({
            measure_uuid: measure.measure_uuid,
            measure_datetime: measure.measure_datetime.toISOString(),
            measure_type: measure.measure_type,
            has_confirmed: measure.validated,
            image_url: measure.image_url,
          })),
        });
      });
  });

  it('filters WATER measures', async () => {
    const createdMeasures = await Promise.all(
      MEASURE_TYPES.map((measureType) =>
        measureService.create({
          customer_code: '123',
          measure_type: measureType,
          measure_datetime: new Date(),
          image_url: faker.internet.url(),
          measure_value: 0,
        }),
      ),
    );

    return request(app.getHttpServer())
      .get('/123/list')
      .query({ measure_type: 'WATER' })
      .expect(200)
      .expect((res) => {
        expect(res.body.measures).toHaveLength(1);

        expect(res.body).toStrictEqual({
          customer_code: '123',
          measures: createdMeasures
            .filter((m) => m.measure_type == 'WATER')
            .map((measure) => ({
              measure_uuid: measure.measure_uuid,
              measure_datetime: measure.measure_datetime.toISOString(),
              measure_type: measure.measure_type,
              has_confirmed: measure.validated,
              image_url: measure.image_url,
            })),
        });
      });
  });
});
