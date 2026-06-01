const { saveSearch, listSearches } = require('../services/search.service');

/**
 * Controller para persistir e listar “notícias pesquisadas”.
 */
async function save(req, res, next) {
  try {
    const { modo, texto, url, resultado, cidade, categoria, analiseIA, factChecks } = req.body;

    const saved = await saveSearch({
      usuario: req.user?.id || null,
      modo,
      texto: texto || '',
      url: url || '',
      resultado: resultado || {},
      cidade: cidade || '',
      categoria: categoria || '',
      analiseIA: analiseIA || {},
      factChecks: factChecks || [],
    });

    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, q, veredito, modo } = req.query;

    const data = await listSearches({
      usuarioId: req.user.id,
      filtros: { page, limit, q, veredito, modo },
    });

    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { save, list };

