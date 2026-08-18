import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../config/db';
import * as bcrypt from 'bcryptjs';
import { Role } from '@car-dealership/shared';

let adminToken: string;
let userToken: string;
let testVehicleId: string;

beforeAll(async () => {
  await prisma.purchase.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const userPassword = await bcrypt.hash('userpassword', 10);

  const adminUser = await prisma.user.create({
    data: {
      username: 'admin_test',
      name: 'Admin User',
      email: 'admin_test@dealership.com',
      passwordHash: adminPassword,
      role: Role.ADMIN
    }
  });

  const normalUser = await prisma.user.create({
    data: {
      username: 'user_test',
      name: 'Normal User',
      email: 'user_test@dealership.com',
      passwordHash: userPassword,
      role: Role.USER
    }
  });

  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin_test@dealership.com', password: 'adminpassword' });
  adminToken = loginAdmin.body.data.token;

  const loginUser = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user_test@dealership.com', password: 'userpassword' });
  userToken = loginUser.body.data.token;

  const vehicle = await prisma.vehicle.create({
    data: {
      make: 'Tesla',
      model: 'Model Y',
      category: 'Electric',
      year: 2024,
      price: 50000,
      quantity: 5
    }
  });
  testVehicleId = vehicle.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Vehicles and Inventory API', () => {
  it('should return all available vehicles', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicles.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow Admins to add a new vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Ford',
        model: 'F-150',
        category: 'Truck',
        year: 2023,
        price: 45000,
        quantity: 10
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Ford');
  });

  it('should deny non-admin users from creating a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        make: 'Audi',
        model: 'Q5',
        category: 'SUV',
        year: 2023,
        price: 40000,
        quantity: 5
      });

    expect(res.statusCode).toBe(403);
  });

  it('should decrease stock and log purchase record on checkout', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(3); // 5 - 2
    expect(res.body.data.purchase.quantity).toBe(2);
  });

  it('should reject purchase when stock is insufficient', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${testVehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
