const express = require('express');
const { query } = require('express-validator');

const adminController = require('../controllers/admin.controller');
const { authJwt, requireAdmin } = require('../middlewares/authJwt');
const { validate } = require('../middlewares/validate');

const router = express.Router();

router.get('/summary', authJwt, requireAdmin, (req, res, next) => adminController.summary(req, res, next));

router.get(
  '/searches',
  authJwt,
  requireAdmin,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('q').optional({ checkFalsy: true }).isString().trim().isLength({ max: 120 }),
    query('modo').optional({ checkFalsy: true }).isIn(['texto', 'link']),
    query('veredito').optional({ checkFalsy: true }).isString().trim().isLength({ max: 80 }),
  ],
  validate,
  (req, res, next) => adminController.listSearches(req, res, next)
);

module.exports = router;
