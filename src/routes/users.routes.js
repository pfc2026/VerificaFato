const express = require('express');
const { param, query, body } = require('express-validator');

const usersController = require('../controllers/users.controller');
const { authJwt, requireAdmin } = require('../middlewares/authJwt');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// Usuário logado
router.get('/me', authJwt, (req, res, next) => usersController.me(req, res, next));

// Lista usuários (admin)
router.get(
  '/',
  authJwt,
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().isString(),
    query('tipo').optional().isIn(['admin', 'usuario']),
    query('ativo').optional().isBoolean(),
  ],
  validate,
  (req, res, next) => usersController.list(req, res, next)
);

// Atualizar usuário (admin)
router.patch(
  '/:id',
  authJwt,
  requireAdmin,
  [
    param('id').isMongoId(),
    body('nome').optional().isString().isLength({ min: 2, max: 120 }),
    body('cpf').optional().isString(),
    body('tipo').optional().isIn(['admin', 'usuario']),
    body('ativo').optional().isBoolean(),
  ],
  validate,
  (req, res, next) => usersController.update(req, res, next)
);

module.exports = router;

