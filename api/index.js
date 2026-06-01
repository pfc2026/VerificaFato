const mongoose = require('mongoose');

const { createApp } = require('../src/app');
const { getEnv } = require('../src/config/env');

let app;
let connectionPromise;

async function connectOnce() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    const env = getEnv();
    connectionPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
    });
  }

  await connectionPromise;
}

module.exports = async function handler(req, res) {
  if (!app) {
    app = createApp();
  }

  await connectOnce();
  return app(req, res);
};
