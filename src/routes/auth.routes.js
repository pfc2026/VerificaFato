const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate');
const { authJwt } = require('../middlewares/authJwt');
const { rateLimit } = require('../middlewares/rateLimit');


const router = express.Router();

const registerRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  keyPrefix: 'auth-register',
  message: 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.',
});

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  keyPrefix: 'auth-login',
  message: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
});

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Cadastro de usuário
 *     tags: [Auth]
 */
router.post(
  '/register',
  registerRateLimit,
  [
    body('nome').isString().trim().isLength({ min: 2, max: 120 }),
    body('email').isEmail().normalizeEmail(),
    body('senha').isString().isLength({ min: 6, max: 200 }),
    body('cpf')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .matches(/^\d{11}$/)
      .withMessage('CPF deve conter 11 digitos'),
    body('tipo')
      .optional({ nullable: true })
      .equals('usuario')
      .withMessage('Tipo de usuario nao pode ser definido no cadastro publico'),
    body('ativo')
      .optional({ nullable: true })
      .isBoolean()
      .custom((value) => value === true || value === 'true')
      .withMessage('Status ativo nao pode ser desabilitado no cadastro publico'),
  ],
  validate,
  (req, res, next) => authController.register(req, res, next)
);


/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login e emissão de JWT
 *     tags: [Auth]
 */
router.post(
  '/login',
  loginRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').isString().isLength({ min: 1, max: 200 }),
  ],
  validate,
  (req, res, next) => authController.login(req, res, next)
);

// Dados do usuário logado
// @openapi
// /api/auth/me:
//   get:
//     summary: Retorna dados do usuário logado
//     tags: [Auth]
router.get('/me', authJwt, (req, res, next) => authController.me(req, res, next));

module.exports = router;




