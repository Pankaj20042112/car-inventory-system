const request = require('supertest');
const app = require('../app');
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');

beforeAll(async () => {
  // Connect to test MongoDB database
  await connectDB();
});

afterAll(async () => {
  // Close the database connection
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with default role "user"', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'john_doe',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.username).toEqual('john_doe');
      expect(res.body.user.role).toEqual('user');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify db entry
      const user = await User.findOne({ username: 'john_doe' });
      expect(user).toBeTruthy();
      expect(user.role).toEqual('user');
    });

    it('should register a user with role "admin" if specified', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'admin_user',
          password: 'adminpassword',
          role: 'admin'
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
          password: 'password123'
        });

      // Try registering same username
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'john_doe',
          password: 'differentpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should fail registration if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: ''
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
          role: 'user'
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
});
