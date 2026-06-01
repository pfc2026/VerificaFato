const mongoose = require('mongoose');
const { getEnv } = require('./env');

/**
 * Conexão MongoDB Atlas + Mongoose.
 *
 * Mantido em um arquivo separado para organização e reuso.
 */
async function connectDB() {
  const env = getEnv();

  if (!env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI no .env');
  }

  mongoose.set('strictQuery', false);

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  });
}

module.exports = { connectDB };

