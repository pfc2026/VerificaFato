const Search = require('../models/Search');

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Serviço para persistir resultados de “notícias pesquisadas”.
 */
async function saveSearch({ usuario, modo, texto, url, resultado, cidade, categoria, analiseIA, factChecks }) {
  // Normalização básica de veredito/porcentagem quando existir na resposta.
  // Mantém compatível com diferentes formatos do seu frontend/engine.
  const veredito =
    resultado?.veredito ||
    resultado?.resultado ||
    resultado?.status ||
    (resultado?.analise?.porcentagemVerdade !== undefined ? '' : '');

  const porcentagem =
    resultado?.porcentagem ||
    resultado?.confianca ||
    resultado?.porcentagemVerdade ||
    resultado?.veracityPercentage ||
    analiseIA?.porcentagemVerdade ||
    null;

  return Search.create({
    usuario,
    modo,
    texto: modo === 'texto' ? texto : '',
    url: modo === 'link' ? url : '',
    resultado: resultado || {},
    cidade: cidade || '',
    categoria: categoria || '',
    analiseIA: analiseIA || {},
    factChecks: factChecks || [],
    veredito: typeof veredito === 'string' ? veredito : '',
    porcentagem: typeof porcentagem === 'number' ? porcentagem : null,
  });
}

async function listSearches({ usuarioId, filtros }) {
  const { page = 1, limit = 10, q, veredito, modo } = filtros;

  const filter = { usuario: usuarioId };
  if (modo) filter.modo = modo;
  if (veredito) filter.veredito = veredito;
  if (q) {
    const safeQuery = escapeRegExp(q);
    filter.$or = [
      { texto: { $regex: safeQuery, $options: 'i' } },
      { url: { $regex: safeQuery, $options: 'i' } },
      { veredito: { $regex: safeQuery, $options: 'i' } },
      { 'resultado.observacao': { $regex: safeQuery, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [items, totalItems] = await Promise.all([
    Search.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Search.countDocuments(filter),
  ]);

  return {
    items,
    page: Number(page),
    limit: Number(limit),
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / Number(limit))),
  };
}

module.exports = { saveSearch, listSearches };

