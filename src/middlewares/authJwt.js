const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

/**
 * Middleware para proteger rotas privadas.
 *
 * Lê o token JWT do header Authorization: Bearer <token>
 */
function authJwt(req, res, next) {
  try {
    const env = getEnv();
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'JWT ausente no header Authorization' },
      });
    }

    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.JWT_SECRET);

    // Convention: payload terá sub (userId)
    req.user = {
      id: payload.sub,
      email: payload.email,
      tipo: payload.tipo,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'JWT inválido ou expirado' },
    });
  }
}

/**
 * Middleware para exigir tipo admin.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.tipo !== 'admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Acesso restrito a admin' },
    });
  }
  next();
}

module.exports = { authJwt, requireAdmin };

