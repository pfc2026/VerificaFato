/**
 * Tratamento global de erros.
 * Mantém formato padronizado: { success:false, error:{code,message,details?} }
 */
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;

  // Erros de validação podem ser montados por middleware de validação
  const details = err.details;

  console.error('💥 Erro:', {
    message: err.message,
    status,
    path: req.originalUrl,
    details,
  });

  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Erro interno do servidor',
      ...(details ? { details } : {}),
    },
  });
}

module.exports = { errorHandler };

