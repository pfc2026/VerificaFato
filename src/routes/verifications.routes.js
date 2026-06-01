const express = require('express');
const { param, query, body } = require('express-validator');

const verificationsController = require('../controllers/verifications.controller');
const { authJwt } = require('../middlewares/authJwt');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// Criar verificação (usuário logado)
router.post(
  '/',
  authJwt,
  [
    body('documento').isString().isLength({ min: 1, max: 500 }),
    body('tipoDocumento').isString().isLength({ min: 1, max: 120 }),
    body('valido').isBoolean().optional({ nullable: true }),
    body('observacao').optional().isString().isLength({ max: 2000 }),
    // usuario pode ser omitido; será derivado do token
    body('usuario').optional(),
  ],
  validate,
  (req, res, next) => verificationsController.create(req, res, next)
);

// Listar com filtros e paginação
router.get(
  '/',
  authJwt,
  [
    query('usuario').optional().isMongoId(),
    query('tipoDocumento').optional().isString(),
    query('valido').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().isString(),
  ],
  validate,
  (req, res, next) => verificationsController.list(req, res, next)
);

// Atualizar verificação (para marcar válido e observação)
router.patch(
  '/:id',
  authJwt,
  [
    param('id').isMongoId(),
    body('valido').optional().isBoolean(),
    body('observacao').optional().isString().isLength({ max: 2000 }),
  ],
  validate,
  (req, res, next) => verificationsController.update(req, res, next)
);

module.exports = router;

