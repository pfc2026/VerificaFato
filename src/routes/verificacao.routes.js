const express = require('express');
const { body } = require('express-validator');

const verificacaoController = require('../controllers/verificacao.controller');
const { rateLimit } = require('../middlewares/rateLimit');
const { validate } = require('../middlewares/validate');

const router = express.Router();

const verificarRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyPrefix: 'verificar',
  message: 'Muitas verificacoes em pouco tempo. Aguarde alguns minutos e tente novamente.',
});

/**
 * @openapi
 * /api/verificar:
 *   post:
 *     summary: Verificar notícia (texto ou link)
 *     tags: [Verificação]
 *     description: Analisa uma notícia usando IA e fact-checking databases
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modo:
 *                 type: string
 *                 enum: [texto, link]
 *               texto:
 *                 type: string
 *                 description: Texto da notícia (se modo=texto)
 *               link:
 *                 type: string
 *                 description: URL da notícia (se modo=link)
 *               cidade:
 *                 type: string
 *               categoria:
 *                 type: string
 *             required: [modo]
 */
router.post(
  '/',
  verificarRateLimit,
  [
    body('modo').isIn(['texto', 'link']),
    body('texto')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isLength({ min: 20, max: 10000 }),
    body('link')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .trim()
      .isURL({ protocols: ['http', 'https'], require_protocol: true }),
    body('cidade').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 120 }),
    body('categoria').optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 80 }),
    body('modo').custom((modo, { req }) => {
      const texto = String(req.body.texto || '').trim();
      const link = String(req.body.link || '').trim();

      if (modo === 'texto' && !texto) {
        throw new Error('Texto e obrigatorio quando modo=texto');
      }
      if (modo === 'link' && !link) {
        throw new Error('Link e obrigatorio quando modo=link');
      }
      if (texto && link) {
        throw new Error('Envie apenas texto ou link, nao ambos');
      }

      return true;
    }),
  ],
  validate,
  (req, res, next) => verificacaoController.verificar(req, res, next)
);

/**
 * Health check para verificador
 */
router.get('/status', (req, res) => verificacaoController.statusVerificador(req, res));

module.exports = router;
