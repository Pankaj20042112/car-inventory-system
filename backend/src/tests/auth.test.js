const request = require('supertest');
const app = require('../app');
const prisma = require('../config/db');

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear users before each test
    await prisma.user.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with default role "user"', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'john_doe',
          password: 'password123',
          name: 'John Doe',
          email: 'john@example.com',
          category: 'Customer'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toEqual('john_doe');
      expect(res.body.user.role).toEqual('user');
      expect(res.body.user.name).toEqual('John Doe');
      expect(res.body.user.email).toEqual('john@example.com');
      expect(res.body.user.category).toEqual('Customer');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify db entry
      const user = await prisma.user.findUnique({ where: { username: 'john_doe' } });
      expect(user).toBeTruthy();
      expect(user.role).toEqual('user');
    });

    it('should register a user with role "admin" if specified', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin_user',
          password: 'adminpassword',
          role: 'admin',
          name: 'Admin User',
          email: 'admin_user@example.com',
          category: 'Dealer'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.user.role).toEqual('admin');
    });

    it('should fail registration if username is already taken', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'john_doe',
          password: 'password123',
          name: 'John Doe',
          email: 'john@example.com',
          category: 'Customer'
        });

      // Try registering same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'john_doe',
          password: 'differentpassword',
          name: 'John Doe Two',
          email: 'john2@example.com',
          category: 'Customer'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail registration if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: '',
          password: 'password123',
          name: 'John Doe',
          email: 'john@example.com',
          category: 'Customer'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'login_test',
          password: 'password123',
          role: 'user',
          name: 'Login Test User',
          email: 'logintest@example.com',
          category: 'Customer'
        });
    });

    it('should login successfully with correct credentials and return a JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login_test',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toEqual('login_test');
      expect(res.body.user.role).toEqual('user');
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'login_test',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail login with non-existent username', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/auth/profile and /password', () => {
    let token;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'profile_test',
          password: 'password123',
          name: 'Original Name',
          email: 'original@example.com',
          category: 'Customer'
        });

      const login = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'profile_test',
          password: 'password123'
        });
      token = login.body.token;
    });

    it('should update user profile details', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          email: 'updated@example.com',
          category: 'Gold'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated Name');
      expect(res.body.email).toEqual('updated@example.com');
      expect(res.body.category).toEqual('Gold');
    });

    it('should update user password securely', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newsecurepassword'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Password updated successfully');

      // Login with new password should succeed
      const relogin = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'profile_test',
          password: 'newsecurepassword'
        });
      expect(relogin.statusCode).toEqual(200);
    });
  });
});
