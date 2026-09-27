import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Orders contract (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /carts/add → 201, discountedPrice rounds to 2dp', async () => {
    const response = await request(app.getHttpServer())
      .post('/carts/add')
      .send({
        userId: 1,
        products: [{ id: 1, quantity: 2 }],
        address: { address: '1 Sukhumvit Rd', email: 'a@b.com', phone: '0812345678' },
      })
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(Number),
      userId: 1,
      products: [
        {
          id: 1,
          title: 'Velvet Matte Lipstick',
          price: 9.99,
          quantity: 2,
          total: 19.98,
          discountPercentage: 10.48,
          discountedPrice: 17.89,
          thumbnail: expect.any(String),
        },
      ],
      total: 19.98,
      discountedTotal: 17.89,
      totalProducts: 1,
      totalQuantity: 2,
    });
  });
});
