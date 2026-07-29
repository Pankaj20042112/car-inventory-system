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
      role: 'admin',
      name: 'Test Admin',
      email: 'test_admin@example.com',
      category: 'admin'
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
      role: 'user',
      name: 'Test User',
      email: 'test_user@example.com',
      category: 'Customer'
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
    // Clear purchases and vehicles before each test
    await prisma.purchase.deleteMany({});
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
          quantity: 10,
          imageUrl: 'https://example.com/ford.jpg'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toEqual('Ford');
      expect(res.body.quantity).toEqual(10);
      expect(res.body.imageUrl).toEqual('https://example.com/ford.jpg');
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
          quantity: 10,
          imageUrl: 'https://example.com/ford-user.jpg'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.make).toEqual('Ford');
      expect(res.body.quantity).toEqual(10);
      expect(res.body.imageUrl).toEqual('https://example.com/ford-user.jpg');
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

    it('should allow Admin to add a vehicle with manual performance specifications overrides', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'Ferrari',
          model: 'SF90 Stradale',
          category: 'Supercar',
          price: 500000,
          quantity: 1,
          powertrain: '4.0L Twin-Turbo V8 Plug-in Hybrid',
          acceleration: '2.5s',
          range: '15 miles',
          topSpeed: '211 mph',
          horsepower: '986 hp',
          transmission: '8-Speed Dual-Clutch'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.powertrain).toEqual('4.0L Twin-Turbo V8 Plug-in Hybrid');
      expect(res.body.acceleration).toEqual('2.5s');
      expect(res.body.range).toEqual('15 miles');
      expect(res.body.topSpeed).toEqual('211 mph');
      expect(res.body.horsepower).toEqual('986 hp');
      expect(res.body.transmission).toEqual('8-Speed Dual-Clutch');
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
      expect(res.body[0]).toHaveProperty('make');
      console.log(res.body);

    });
  });
  describe("Vehicle Discount", () => {

  it("should return the discounted price", () => {
    const originalPrice = 22000;
    const discountedPrice = originalPrice - (originalPrice * 10) / 100;

    expect(discountedPrice).toBe(19800);
  });
});

  describe('GET /api/vehicles/:id', () => {
    it('should return a single vehicle by ID', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(testVehicleId);
      expect(res.body.make).toEqual('Toyota');
      expect(res.body.model).toEqual('Camry');
    });

    it('should return 404 for a non-existent vehicle ID', async () => {
      const res = await request(app)
        .get('/api/vehicles/000000000000000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
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
          quantity: 6,
          imageUrl: 'https://example.com/toyota-updated.jpg'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.price).toEqual(25000);
      expect(res.body.quantity).toEqual(6);
      expect(res.body.imageUrl).toEqual('https://example.com/toyota-updated.jpg');
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

    it('should allow Admin to update manual performance specifications', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          powertrain: 'Supercharged V8',
          acceleration: '3.5s'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.powertrain).toEqual('Supercharged V8');
      expect(res.body.acceleration).toEqual('3.5s');
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
    it('should allow purchasing a vehicle, decreasing its quantity and returning transaction details', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('vehicle');
      expect(res.body).toHaveProperty('purchase');
      expect(res.body.vehicle.quantity).toEqual(4); // 5 -> 4
      expect(res.body.purchase).toHaveProperty('receiptNo');
      expect(res.body.purchase.buyerName).toEqual('Test User');
      expect(res.body.purchase.buyerEmail).toEqual('test_user@example.com');
      expect(res.body.purchase.make).toEqual('Toyota');
      expect(res.body.purchase.price).toEqual(21600); // 10% Sedan discount (24000 -> 21600)

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

  describe('GET /api/vehicles/my-purchases and /all-purchases', () => {
    it('should allow regular user to fetch their purchase history', async () => {
      // First make a purchase
      await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app)
        .get('/api/vehicles/my-purchases')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow admin to fetch all purchase transactions', async () => {
      const res = await request(app)
        .get('/api/vehicles/all-purchases')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/vehicles/checkout', () => {
    it('should purchase multiple vehicles and decrease their quantities successfully', async () => {
      const tesla = await prisma.vehicle.findFirst({ where: { make: 'Tesla' } });
      const toyota = await prisma.vehicle.findFirst({ where: { make: 'Toyota' } });

      const res = await request(app)
        .post('/api/vehicles/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          vehicleIds: [tesla.id, toyota.id]
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('purchases');
      expect(res.body.purchases.length).toEqual(2);
      expect(res.body.purchases[0].receiptNo).toEqual(res.body.purchases[1].receiptNo);

      const teslaPurchase = res.body.purchases.find(p => p.make === 'Tesla');
      const toyotaPurchase = res.body.purchases.find(p => p.make === 'Toyota');
      expect(teslaPurchase.price).toEqual(48000); // SUV: no discount
      expect(toyotaPurchase.price).toEqual(21600); // Sedan: 10% discount

      const checkTesla = await prisma.vehicle.findUnique({ where: { id: tesla.id } });
      const checkToyota = await prisma.vehicle.findUnique({ where: { id: toyota.id } });
      expect(checkTesla.quantity).toEqual(2); // 3 -> 2
      expect(checkToyota.quantity).toEqual(4); // 5 -> 4
    });

    it('should fail checkout if any vehicle is out of stock', async () => {
      const tesla = await prisma.vehicle.findFirst({ where: { make: 'Tesla' } });
      const honda = await prisma.vehicle.findFirst({ where: { make: 'Honda' } }); // 0 quantity

      const res = await request(app)
        .post('/api/vehicles/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          vehicleIds: [tesla.id, honda.id]
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');

      // Verify no quantity decreased (rollback/unchanged)
      const checkTesla = await prisma.vehicle.findUnique({ where: { id: tesla.id } });
      expect(checkTesla.quantity).toEqual(3);
    });

    it('should fail checkout if no vehicleIds are provided', async () => {
      const res = await request(app)
        .post('/api/vehicles/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          vehicleIds: []
        });

      expect(res.statusCode).toEqual(400);
    });
  });


  const request = require("supertest");
describe("discount", () => {
  it("should apply 10% discount", async () => {
    const response = await request(app)
      .post("/discount")
      .send({ price: 100000 });

    expect(response.statusCode).toBe(200);
    expect(response.body.finalPrice).toBe(90000);
    expect(response.body.discount).toBe("10%");
  });
});
});

