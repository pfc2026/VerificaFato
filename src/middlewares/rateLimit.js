function getClientKey(req, prefix) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || req.ip || req.socket?.remoteAddress || 'unknown').split(',')[0];

  return `${prefix}:${ip.trim() || 'unknown'}`;
}

function formatRetryAfter(ms) {
  return Math.max(1, Math.ceil(ms / 1000));
}

/**
 * Rate limiter em memória, suficiente para single-process/dev.
 * Em produção horizontal, substitua o store por Redis ou outro backend compartilhado.
 */
function rateLimit({ windowMs = 15 * 60 * 1000, max = 100, keyPrefix = 'global', message } = {}) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = getClientKey(req, keyPrefix);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(max - 1));
      return next();
    }

    current.count += 1;
    const remaining = Math.max(0, max - current.count);
    const retryAfterMs = current.resetAt - now;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(formatRetryAfter(retryAfterMs)));

    if (current.count > max) {
      res.setHeader('Retry-After', String(formatRetryAfter(retryAfterMs)));
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: message || 'Muitas requisicoes em pouco tempo. Tente novamente em instantes.',
        },
      });
    }

    return next();
  };
}

module.exports = { rateLimit };
