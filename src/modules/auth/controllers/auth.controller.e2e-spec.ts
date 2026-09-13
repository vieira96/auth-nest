import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { AuthService } from '@/modules/auth/services/auth.service';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types';

describe('POST /auth/register (E2E)', () => {
  let app: INestApplication<App>;
  const authService = {
    register: vi.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('cadastra uma requisição válida', async () => {
    authService.register.mockResolvedValue({
      id: 'user-id',
      name: 'Maria Silva',
      email: 'maria@example.com',
      createdAt: '2026-09-13T00:00:00.000Z',
    });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: ' Maria Silva ',
        email: ' Maria@Example.com ',
        password: 'strong-password',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.email).toBe('maria@example.com');
      });

    expect(authService.register).toHaveBeenCalledWith({
      name: 'Maria Silva',
      email: 'maria@example.com',
      password: 'strong-password',
    });
  });

  it('rejeita uma requisição inválida antes de chegar ao serviço', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: 'invalid-email', password: 'short' })
      .expect(400);

    expect(authService.register).not.toHaveBeenCalled();
  });
});
