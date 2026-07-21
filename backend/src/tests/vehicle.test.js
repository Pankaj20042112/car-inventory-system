const request = require('supertest');
const app = require('../app');
const prisma = require('../config/db');

let userToken;
let adminToken;
let testVehicleId;

beforeAll(async () => {
  // Connect to database
  await prisma.$connect();

  // Clear users first
  await prisma.user.deleteMany({});

  // Create admin user and log in
  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'test_admin',
      password: 'adminpassword',
      role: 'admin'
    });

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'test_admin',
      password: 'adminpassword'
    });
  adminToken = adminLogin.body.token;

  // Create regular user and log in
  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'test_user',
      password: 'userpassword',
      role: 'user'
    });

  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'test_user',
      password: 'userpassword'
    });
  userToken = userLogin.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Vehicles and Inventory API', () => {
  beforeEach(async () => {
    // Clear vehicles and insert test vehicles
    await prisma.vehicle.deleteMany({});

    const car = await prisma.vehicle.create({
      data: {
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 24000,
        quantity: 5
      }
    });
    testVehicleId = car.id;

    await prisma.vehicle.create({
      data: {
        make: 'Tesla',
        model: 'Model Y',
        category: 'SUV',
        price: 48000,
        quantity: 3
      }
    });

    await prisma.vehicle.create({
      data: {
        make: 'Honda',
        model: 'Civic',
        category: 'Sedan',
        price: 22000,
        quantity: 0
      }
    });
  });

  describe('POST /api/vehicles', () => {
    it('should allow Admin to add a new vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 35000,
          quantity: 10
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toEqual('Ford');
      expect(res.body.quantity).toEqual(10);
    });

    it('should allow a regular user to add a new vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 35000,
          quantity: 10
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toEqual('Ford');
      expect(res.body.quantity).toEqual(10);
    });

    it('should deny unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .send({
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 35000,
          quantity: 10
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should allow users to view all available vehicles', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(3);
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('should search vehicles by make', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=Tesla')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].model).toEqual('Model Y');
    });

    it('should search vehicles by category', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?category=Sedan')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
    });

    it('should filter vehicles by price range', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?minPrice=20000&maxPrice=30000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2); // Camry (24000) and Civic (22000)
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    it('should allow Admin to update vehicle details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 25000,
          quantity: 6
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.price).toEqual(25000);
      expect(res.body.quantity).toEqual(6);
      expect(res.body.make).toEqual('Toyota'); // Unchanged fields remain
    });

    it('should deny regular users from updating vehicle details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: 25000
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should allow Admin to delete a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');

      const check = await prisma.vehicle.findUnique({ where: { id: testVehicleId } });
      expect(check).toBeNull();
    });

    it('should deny regular users from deleting a vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should allow purchasing a vehicle, decreasing its quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(4); // 5 -> 4

      const check = await prisma.vehicle.findUnique({ where: { id: testVehicleId } });
      expect(check.quantity).toEqual(4);
    });

    it('should fail purchase if vehicle is out of stock', async () => {
      const outOfStockCar = await prisma.vehicle.findFirst({ where: { make: 'Honda' } });

      const res = await request(app)
        .post(`/api/vehicles/${outOfStockCar.id}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow Admin to restock a vehicle, increasing its quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 10
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.quantity).toEqual(15); // 5 + 10

      const check = await prisma.vehicle.findUnique({ where: { id: testVehicleId } });
      expect(check.quantity).toEqual(15);
    });

    it('should deny regular users from restocking a vehicle', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 10
        });

      expect(res.statusCode).toEqual(403);
    });
  });
});
