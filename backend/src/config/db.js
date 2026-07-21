const { Sequelize } = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dbName = env === 'test' ? 'database.test.sqlite' : 'database.sqlite';
const storagePath = path.join(__dirname, '..', '..', dbName);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false, // Set to console.log to see SQL queries
  define: {
    timestamps: true
  }
});

module.exports = sequelize;
