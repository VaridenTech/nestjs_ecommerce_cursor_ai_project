import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Products contract (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products/categories → 200, 24 categories', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/categories')
      .expect(200);

    expect(response.body).toHaveLength(24);
    expect(Object.keys(response.body[0]).sort()).toEqual(['name', 'slug', 'url']);
  });

  it('GET /products/1 → 200, product with 22 keys', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/1')
      .expect(200);

    expect(Object.keys(response.body)).toHaveLength(22);
    expect(response.body.title).toBe('Velvet Matte Lipstick');
    expect(typeof response.body.category).toBe('string');
    expect(Array.isArray(response.body.reviews)).toBe(true);
  });

  it('GET /products/9999 → 404 with the exact message', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/9999')
      .expect(404);

    expect(response.body.message).toBe('Product 9999 not found');
  });

  it('GET /products/abc → 400 with message', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/abc')
      .expect(400);

    expect(response.body.message).toBeDefined();
  });
});
