const express = require('express');
const { query } = require('express-validator');

const logsController = require('../controllers/logs.controller');
const { authJwt, requireAdmin } = require('../middlewares/authJwt');
const { validate } = require('../middlewares/validate');

const router = express.Router();

// Listar logs (admin)
router.get(
  '/',
  authJwt,
  requireAdmin,
  [
    query('usuario').optional().isMongoId(),
    query('acao').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional().isString(),
  ],
  validate,
  (req, res, next) => logsController.list(req, res, next)
);

module.exports = router;

