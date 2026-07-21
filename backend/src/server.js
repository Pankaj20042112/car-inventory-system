require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Establish connection to MongoDB database instance
    await connectDB();

    // Seed default admin user if not present
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
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
