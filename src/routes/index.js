const express = require('express');

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const usersRoutes = require('./users.routes');
const verificationsRoutes = require('./verifications.routes');
const verificacaoRoutes = require('./verificacao.routes');
const logsRoutes = require('./logs.routes');
const searchRoutes = require('./search.routes');


const router = express.Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas administrativas
router.use('/admin', adminRoutes);

// Rotas de usuários
router.use('/users', usersRoutes);

// Rotas de verificações (documento/validações)
router.use('/verifications', verificationsRoutes);

// Rota de verificação de notícias (público)
router.use('/verificar', verificacaoRoutes);

// Rotas de logs
router.use('/logs', logsRoutes);

// Rotas de busca/pesquisas (notícias pesquisadas)
router.use('/search', searchRoutes);

module.exports = router;


