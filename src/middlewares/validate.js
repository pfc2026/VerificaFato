const { validationResult } = require('express-validator');

/**
 * Helper middleware: se houver erros de express-validator, lança erro controlado.
 */
function validate(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const err = new Error('Falha na validação de entrada');
    err.statusCode = 400;
    err.code = 'VALIDATION_ERROR';
    err.details = result.array();
    return next(err);
  }

  return next();
}


module.exports = { validate };

