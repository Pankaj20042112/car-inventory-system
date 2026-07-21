const mongoose = require('mongoose');

const connectDB = async () => {
  const env = process.env.NODE_ENV || 'development';
  const uri = env === 'test'
    ? (process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/car_dealership_test')
    : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/car_dealership');

  try {
    const conn = await mongoose.connect(uri);
    if (env !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
