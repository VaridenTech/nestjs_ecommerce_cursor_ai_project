import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('Auth contract (e2e)', () => {
  let app: INestApplication;
  const email = `student-${Date.now()}@example.com`;
  const password = 'secret123';
  let accessToken: string;
  let refreshToken: string;

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
    await app.get(PrismaService).user.deleteMany({ where: { email } });
    await app.close();
  });

  it('POST /auth/signup → 201 without any password field', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name: 'Student' })
      .expect(201);

    expect(Object.keys(response.body)).not.toContain('passwordHash');
    expect(Object.keys(response.body)).not.toContain('password');
  });

  it('POST /auth/signup with the same email → 409', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, name: 'Student' })
      .expect(409);
  });

  it('POST /auth/login → same message for wrong password and unknown email', async () => {
    const wrongPassword = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'not-the-password' })
      .expect(401);

    const unknownEmail = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password })
      .expect(401);

    expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
  });

  it('POST /auth/login → 200 with an access token and a refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(typeof response.body.accessToken).toBe('string');
    expect(typeof response.body.refreshToken).toBe('string');
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  it('GET /auth/me without a token → 401', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('GET /auth/me with a token → 200 and the signed-up email', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(email);
  });

  it('POST /auth/refresh with a refresh token that was already used → 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('GET /admin/orders with a USER token → 403', async () => {
    await request(app.getHttpServer())
      .get('/admin/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });
});
