import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Products contract (e2e)', () => {
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

  it('GET /products?limit=5&skip=0 → limit and skip echo the request', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?limit=5&skip=0')
      .expect(200);

    expect(Object.keys(response.body).sort()).toEqual(['limit', 'products', 'skip', 'total']);
    expect(response.body.limit).toBe(5);
    expect(response.body.skip).toBe(0);
    expect(response.body.products).toHaveLength(5);
  });

  it('GET /products?limit=0 → 400 (out of range)', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?limit=0')
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('GET /products?limit=101 → 400 (out of range)', async () => {
    const response = await request(app.getHttpServer())
      .get('/products?limit=101')
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('GET /products/category/groceries → total 27', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/category/groceries?limit=20&skip=0')
      .expect(200);

    expect(Object.keys(response.body).sort()).toEqual(['limit', 'products', 'skip', 'total']);
    expect(response.body.total).toBe(27);
    expect(response.body.products).toHaveLength(20);
  });

  it('GET /products/category/nope → 200, empty envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/category/nope?limit=5&skip=0')
      .expect(200);

    expect(response.body).toEqual({ products: [], total: 0, skip: 0, limit: 5 });
  });
});
