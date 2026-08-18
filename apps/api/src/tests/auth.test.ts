import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../config/db';

beforeAll(async () => {
  await prisma.purchase.deleteMany({});
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Authentication API', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Customer',
        email: 'john@example.com',
        password: 'SecurePassword123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('john@example.com');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: '123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another John',
        email: 'john@example.com',
        password: 'SecurePassword123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'SecurePassword123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@example.com',
        password: 'WrongPassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
