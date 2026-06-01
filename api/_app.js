const mongoose = require('mongoose');

let app;
let connectionPromise;

function getApp() {
  if (!app) {
    const { createApp } = require('../src/app');
    app = createApp();
  }

  return app;
}

function getDatabaseErrorPayload(err) {
  const message = err?.message || '';
  const isConfigError = /Missing MONGODB_URI|Missing JWT_SECRET/i.test(message);
  const isMongoError =
    err?.name === 'MongooseServerSelectionError' ||
    /querySrv|ENOTFOUND|ECONNREFUSED|timed out|server selection/i.test(message);

  return {
    status: 500,
    body: {
      sucesso: false,
      erro: {
        code: isConfigError ? 'CONFIG_ERROR' : isMongoError ? 'DATABASE_CONNECTION_ERROR' : 'SERVER_ERROR',
        message: isConfigError
          ? 'Configuração ausente no Vercel. Confira MONGODB_URI e JWT_SECRET nas Environment Variables.'
          : isMongoError
            ? 'Não foi possível conectar ao MongoDB. Confira a URI e o acesso de rede no MongoDB Atlas.'
            : 'Erro interno ao executar a função no Vercel.',
      },
    },
  };
}

function needsDatabase(req) {
  const path = req.url.split('?')[0];
  return (
    path.startsWith('/api/auth') ||
    path.startsWith('/api/search') ||
    path.startsWith('/api/users') ||
    path.startsWith('/api/logs') ||
    path.startsWith('/api/verifications')
  );
}

async function connectOnce() {
  if (mongoose.connection.readyState === 1) return;

  if (!connectionPromise) {
    const { getEnv } = require('../src/config/env');
    const env = getEnv();
    connectionPromise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    await connectionPromise;
  } catch (err) {
    connectionPromise = null;
    throw err;
  }
}

async function handler(req, res) {
  try {
    if (needsDatabase(req)) {
      await connectOnce();
    }

    return getApp()(req, res);
  } catch (err) {
    console.error('Vercel function error:', err);
    const payload = getDatabaseErrorPayload(err);
    return res.status(payload.status).json(payload.body);
  }
}

module.exports = handler;
