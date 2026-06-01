const mongoose = require('mongoose');

const { createApp } = require('./app');
const { getEnv } = require('./config/env');
const { seedAdmin } = require('./seed/seedAdmin');

/**
 * Boot da aplicação.
 * - Conecta MongoDB
 * - Executa seed de admin
 * - Inicia o servidor HTTP
 */
async function startServer() {
  const env = getEnv();

  // Conexão MongoDB
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  });


  // Seed admin automático (se ainda não existir)
  await seedAdmin();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${env.PORT}`);
  });
}

startServer().catch((err) => {
  console.error('❌ Erro ao iniciar o servidor:', err);
  process.exit(1);
});

