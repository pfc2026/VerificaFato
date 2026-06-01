// api/_app.js
// Exporta o app Express configurado, SEM chamar app.listen().
// Usado tanto pelo handler serverless (Vercel) quanto pelo server.js local.

'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middlewares globais ────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Conexão com MongoDB (lazy — só conecta uma vez por instância) ──
let mongoConnected = false;

async function ensureMongoConnected() {
  if (mongoConnected) return;
  try {
    const mongoose = require('mongoose');

    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGODB_URI;
      if (!uri) throw new Error('MONGODB_URI não definida nas variáveis de ambiente.');

      await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB_NAME || 'verificaoeste_db',
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB conectado:', mongoose.connection.host);
    }

    mongoConnected = true;
  } catch (err) {
    console.error('❌ Falha ao conectar no MongoDB:', err.message);
    throw err;
  }
}

// Middleware que garante conexão antes de qualquer rota da API
app.use('/api', async (req, res, next) => {
  try {
    await ensureMongoConnected();
    next();
  } catch (err) {
    res.status(503).json({
      sucesso: false,
      mensagem: 'Serviço indisponível: banco de dados não acessível.',
      detalhe: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    });
  }
});

// ── Rotas da API ───────────────────────────────────────────────────
// Importa as rotas do src/ (MVC)
try {
  const apiRoutes = require('../src/routes/index');
  app.use('/api', apiRoutes);
} catch (e) {
  // Fallback mínimo para saúde da função
  app.get('/api/health', (_req, res) =>
    res.json({ sucesso: true, status: 'ok', aviso: 'Rotas MVC não carregadas: ' + e.message })
  );
  console.error('⚠️  Falha ao carregar rotas MVC:', e.message);
}

// ── Swagger (opcional) ────────────────────────────────────────────
try {
  const swaggerUi   = require('swagger-ui-express');
  const swaggerSpec  = require('../src/config/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (_) { /* swagger não é crítico */ }

// ── Frontend estático ─────────────────────────────────────────────
// Vercel serve os estáticos diretamente — só precisa disso em dev local.
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
  );
}

// ── Handler global de erros ───────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('💥 Erro não tratado:', err);
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: err.message || 'Erro interno do servidor.',
  });
});

module.exports = app;
