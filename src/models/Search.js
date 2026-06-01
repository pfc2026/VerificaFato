const mongoose = require('mongoose');

/**
 * Modelo para salvar “notícias pesquisadas”.
 *
 * Campos projetados para armazenar:
 * - entrada do usuário (texto/link)
 * - resultado do processamento (veredito/score/fontes/metadata)
 * - vínculo com o usuário (usuario)
 * - contexto regional (cidade, categoria)
 * - análise de IA completa (analiseIA, factChecks)
 */
const SearchSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Pode ser anônimo
      index: true,
    },

    // Entrada do usuário
    modo: {
      type: String,
      enum: ['texto', 'link'],
      required: true,
      index: true,
    },
    texto: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },

    // Contexto regional
    cidade: {
      type: String,
      default: '',
      index: true,
    },
    categoria: {
      type: String,
      default: '',
      index: true,
    },

    // Resultado do processamento (ML + fact-check + heurísticas, etc.)
    resultado: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Análise de IA detalhada
    analiseIA: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Fact-checks encontrados
    factChecks: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    // Campos facilitadores para filtros comuns
    veredito: {
      type: String,
      default: '',
      index: true,
    },
    porcentagem: {
      type: Number,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

SearchSchema.index({ usuario: 1, createdAt: -1 });
SearchSchema.index({ usuario: 1, modo: 1, createdAt: -1 });
SearchSchema.index({ usuario: 1, veredito: 1, createdAt: -1 });

module.exports = mongoose.model('Search', SearchSchema);

