require('dotenv').config();

/**
 * Centraliza leitura do .env e fornece defaults quando aplicável.
 *
 * Para produção, recomenda-se configurar todas as variáveis obrigatórias.
 */
function getEnv() {
  const {
    NODE_ENV = 'development',
    PORT = 3000,
    CORS_ORIGIN = '*',
    MONGODB_URI,
    MONGODB_DB_NAME = 'pfc2026ifpr_db',
    JWT_SECRET,
    JWT_EXPIRES_IN = '7d',

    // Seed admin (opcional)
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
  } = process.env;

  // Observação: alguns ambientes/execuções não carregam corretamente o .env.
  // Para evitar crash silencioso no desenvolvimento, validamos apenas se estiver rodando.
  if (!MONGODB_URI) {
    // Continua lançando erro porque o banco é obrigatório.
    throw new Error('Missing MONGODB_URI no .env');
  }
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET no .env');
  }

  return {

    NODE_ENV,
    PORT: Number(PORT),
    CORS_ORIGIN,
    MONGODB_URI,
    MONGODB_DB_NAME,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
  };
}

module.exports = { getEnv };

