const { PrismaClient } = require('@prisma/client');

const dbUrl = process.env.NODE_ENV === 'test'
  ? (process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/car_dealership_test')
  : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_dealership');

// Create single shared instance of the Prisma Client with dynamic URL override
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

module.exports = prisma;
