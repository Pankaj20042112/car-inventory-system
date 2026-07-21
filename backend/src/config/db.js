const { PrismaClient } = require('@prisma/client');

// Create single shared instance of the Prisma Client
const prisma = new PrismaClient();

module.exports = prisma;
