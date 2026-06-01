const mongoose = require('mongoose');

const { createApp } = require('../src/app');
const { getEnv } = require('../src/config/env');

let app;
let connectionPromise;

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

module.exports = async function handler(req, res) {
  try {
    if (!app) {
      app = createApp();
    }

    if (needsDatabase(req)) {
      await connectOnce();
    }

    return app(req, res);
  } catch (err) {
    console.error('Vercel function error:', err);

    const isConfigError = /Missing MONGODB_URI|Missing JWT_SECRET/i.test(err.message);
    const isMongoError =
      err.name === 'MongooseServerSelectionError' ||
      /querySrv|ENOTFOUND|ECONNREFUSED|timed out|server selection/i.test(err.message);

    return res.status(500).json({
      sucesso: false,
      erro: {
        code: isConfigError ? 'CONFIG_ERROR' : isMongoError ? 'DATABASE_CONNECTION_ERROR' : 'SERVER_ERROR',
        message: isConfigError
          ? 'Configuração ausente no Vercel. Confira MONGODB_URI e JWT_SECRET nas Environment Variables.'
          : isMongoError
            ? 'Não foi possível conectar ao MongoDB. Confira a URI e o acesso de rede no MongoDB Atlas.'
            : 'Erro interno ao executar a função no Vercel.',
      },
    });
  }
};
