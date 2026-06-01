/**
 * Middleware para normalizar respostas JSON.
 * Transforma { success, data } em { sucesso, dados } para compatibilidade com frontend.
 * 
 * Injeta um método res.json() customizado que transforma a resposta antes de enviar.
 */
function responseNormalizer(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function(obj) {
    if (obj && typeof obj === 'object') {
      // Se objeto tem 'success' ou 'data', normaliza
      if (obj.success !== undefined || obj.data !== undefined || obj.error !== undefined) {
        const normalized = {
          ...(obj.success !== undefined && { sucesso: obj.success }),
          ...(obj.data !== undefined && { dados: obj.data }),
          ...(obj.error !== undefined && { erro: obj.error }),
        };

        // Se normalizou algo, usa o objeto normalizado, senão usa o original
        if (Object.keys(normalized).length > 0) {
          return originalJson(normalized);
        }
      }
    }

    return originalJson(obj);
  };

  next();
}

module.exports = { responseNormalizer };
