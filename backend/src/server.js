require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB via Prisma Client
    await prisma.$connect();
    console.log('Connected to MongoDB via Prisma Client.');

    // Seed default admin user if not present
    const bcrypt = require('bcryptjs');
    const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('Successfully pre-seeded default admin account (admin / admin123)');
    }

    app.listen(PORT, () => {
      console.log(`Backend API Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server:', error);
    process.exit(1);
  }
};

startServer();
