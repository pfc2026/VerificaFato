function findUnsafeKey(value, path = '') {
  if (!value || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const unsafe = findUnsafeKey(value[index], `${path}[${index}]`);
      if (unsafe) return unsafe;
    }
    return null;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      return path ? `${path}.${key}` : key;
    }

    const unsafe = findUnsafeKey(value[key], path ? `${path}.${key}` : key);
    if (unsafe) return unsafe;
  }

  return null;
}

/**
 * Bloqueia payloads com chaves que podem virar operadores MongoDB.
 */
function mongoSanitize(req, res, next) {
  const targets = [
    ['body', req.body],
    ['query', req.query],
    ['params', req.params],
  ];

  for (const [location, value] of targets) {
    const unsafeKey = findUnsafeKey(value, location);
    if (unsafeKey) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Entrada contem chave nao permitida.',
          details: [{ location, path: unsafeKey }],
        },
      });
    }
  }

  return next();
}

module.exports = { mongoSanitize };
