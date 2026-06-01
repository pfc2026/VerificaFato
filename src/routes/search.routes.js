const express = require('express');
const { body, query } = require('express-validator');

const searchController = require('../controllers/search.controller');
const { authJwt } = require('../middlewares/authJwt');
const { rateLimit } = require('../middlewares/rateLimit');
const { validate } = require('../middlewares/validate');

const router = express.Router();

const saveSearchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyPrefix: 'search-save',
  message: 'Muitos salvamentos em pouco tempo. Aguarde alguns minutos e tente novamente.',
});

/**
 * @openapi
 * /api/search:
 *   post:
 *     summary: Salvar resultado de uma notícia pesquisada
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authJwt,
  saveSearchRateLimit,
  [
    body('modo').isIn(['texto', 'link']),
    body('texto').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 10000 }),
    body('url')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true }),
    body('resultado').optional().isObject(),
    body('cidade').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 120 }),
    body('categoria').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 80 }),
    body('analiseIA').optional().isObject(),
    body('factChecks').optional().isArray(),
    body('modo').custom((modo, { req }) => {
      const texto = String(req.body.texto || '').trim();
      const url = String(req.body.url || '').trim();

      if (modo === 'texto' && !texto) {
        throw new Error('Texto e obrigatorio quando modo=texto');
      }
      if (modo === 'link' && !url) {
        throw new Error('URL e obrigatoria quando modo=link');
      }
      if (texto && url) {
        throw new Error('Envie apenas texto ou URL, nao ambos');
      }

      return true;
    }),
  ],
  validate,
  (req, res, next) => searchController.save(req, res, next)
);

/**
 * @openapi
 * /api/search:
 *   get:
 *     summary: Listar notícias pesquisadas do usuário
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authJwt,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('q').optional({ checkFalsy: true }).isString().trim().isLength({ max: 120 }),
    query('veredito').optional({ checkFalsy: true }).isString().trim().isLength({ max: 80 }),
    query('modo').optional().isIn(['texto', 'link']),
  ],
  validate,
  (req, res, next) => searchController.list(req, res, next)
);

module.exports = router;

