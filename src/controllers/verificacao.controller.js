/**
 * Controller para verificação de notícias.
 * Endpoint: POST /api/verificar
 * 
 * Processa:
 * 1. Análise de IA (toxicidade, padrões de desinformação)
 * 2. Busca em fact-checking databases (Google Fact Check API)
 * 3. Análise de fontes e credibilidade
 */

const axios = require('axios');
const cheerio = require('cheerio');

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function getVerdict(score) {
  if (score >= 75) return 'provavelmente verdadeiro';
  if (score >= 55) return 'verificar com atenção';
  if (score >= 35) return 'suspeito';
  return 'provavelmente falso';
}

function getRiskLevel(score) {
  if (score >= 75) return 'baixo';
  if (score >= 55) return 'moderado';
  if (score >= 35) return 'alto';
  return 'crítico';
}

function uniqueByDescription(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.descricao)) return false;
    seen.add(item.descricao);
    return true;
  });
}

function getKeywords(text, limit = 10) {
  const stopwords = new Set([
    'para', 'com', 'uma', 'das', 'dos', 'que', 'por', 'mais', 'como', 'sobre',
    'esta', 'este', 'essa', 'esse', 'nas', 'nos', 'pela', 'pelo', 'entre',
    'antes', 'depois', 'todos', 'todas', 'muito', 'muita', 'foi', 'ser', 'tem',
    'sao', 'são', 'nao', 'não', 'tambem', 'também', 'aqui', 'isso', 'isto',
  ]);

  const counts = normalizeText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !stopwords.has(word))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([termo, ocorrencias]) => ({ termo, ocorrencias }));
}

function splitSentences(text) {
  return normalizeText(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 20);
}

function summarizeText(text, maxSentences = 3) {
  const sentences = splitSentences(text);
  if (!sentences.length) return normalizeText(text).substring(0, 280);

  return sentences
    .sort((a, b) => b.length - a.length)
    .slice(0, maxSentences)
    .map((sentence) => sentence.substring(0, 220))
    .join(' ');
}

function extractEntities(text) {
  const cleanText = normalizeText(text);
  const westernCities = [
    'Cascavel', 'Foz do Iguaçu', 'Toledo', 'Marechal Cândido Rondon',
    'Medianeira', 'Laranjeiras do Sul', 'Francisco Beltrão', 'Pato Branco',
    'Matelândia', 'Santa Tereza do Oeste', 'Santa Terezinha de Itaipu',
  ];
  const institutions = [
    'Prefeitura', 'Secretaria de Saúde', 'Secretaria de Educação', 'Câmara Municipal',
    'Governo do Paraná', 'Ministério da Saúde', 'Polícia Civil', 'Polícia Militar',
    'Defesa Civil', 'Universidade', 'Hospital', 'IBGE', 'TRE', 'TSE',
  ];

  const foundCities = westernCities.filter((city) =>
    cleanText.toLowerCase().includes(city.toLowerCase())
  );
  const foundInstitutions = institutions.filter((institution) =>
    cleanText.toLowerCase().includes(institution.toLowerCase())
  );

  const people = (cleanText.match(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+(?:\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]+){1,3}\b/g) || [])
    .filter((name) => !foundCities.includes(name) && !foundInstitutions.includes(name))
    .slice(0, 8);

  return {
    cidades: [...new Set(foundCities)],
    instituicoes: [...new Set(foundInstitutions)],
    pessoasOuLocais: [...new Set(people)],
  };
}

function classifySource(url) {
  if (!url) {
    return {
      dominio: '',
      classificacao: 'sem link',
      confianca: 'não avaliada',
      observacao: 'A notícia foi enviada como texto, sem domínio para avaliar.',
    };
  }

  const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  const officialPatterns = [
    /\.gov\.br$/,
    'cascavel.pr.gov.br',
    'fozdoiguacu.pr.gov.br',
    'toledo.pr.gov.br',
    'saude.pr.gov.br',
    'aen.pr.gov.br',
  ];
  const knownRegional = [
    'oparana.com.br',
    'radiocolmeia.com.br',
    'cascavelnews.com.br',
    'clube.fm',
  ];

  if (officialPatterns.some((pattern) => typeof pattern === 'string' ? hostname.endsWith(pattern) : pattern.test(hostname))) {
    return {
      dominio: hostname,
      classificacao: 'fonte oficial',
      confianca: 'alta',
      observacao: 'Domínio ligado a órgão público ou fonte institucional.',
    };
  }

  if (knownRegional.some((domain) => hostname.endsWith(domain))) {
    return {
      dominio: hostname,
      classificacao: 'veículo regional conhecido',
      confianca: 'média',
      observacao: 'Veículo regional conhecido, ainda assim vale confirmar data, autoria e fontes citadas.',
    };
  }

  return {
    dominio: hostname,
    classificacao: 'fonte não catalogada',
    confianca: 'indefinida',
    observacao: 'Domínio não está na lista local de fontes conhecidas. Verifique autoria, expediente e histórico do site.',
  };
}

function buildImportantInfo({ conteudo, textoExtraido, modo, link, cidade, categoria, analysis, factChecks }) {
  const keywords = getKeywords(conteudo);
  const entities = extractEntities(conteudo);
  const source = classifySource(modo === 'link' ? link : '');
  const factCheckSummary = factChecks.map((item) => ({
    avaliacao: item.avaliacao,
    verificador: item.verificador,
    alegacao: item.alegacao,
    url_revisao: item.url_revisao,
  }));

  const perguntasChecagem = [
    'Quem é o autor ou veículo responsável pela publicação?',
    'A data da notícia é recente e combina com o fato narrado?',
    'A informação aparece em fonte oficial ou em outro veículo confiável?',
  ];

  if (!analysis.metricas?.citaFonte) {
    perguntasChecagem.unshift('Qual fonte primária confirma essa afirmação?');
  }
  if (analysis.sinais?.some((sinal) => sinal.tipo === 'risco')) {
    perguntasChecagem.unshift('O texto usa emoção ou urgência para induzir compartilhamento?');
  }

  return {
    titulo: textoExtraido.titulo,
    resumo: summarizeText(textoExtraido.conteudo || conteudo),
    modo,
    cidade: cidade || '',
    categoria: categoria || '',
    fonte: source,
    palavrasChave: keywords,
    entidades: entities,
    metricas: analysis.metricas || {},
    perguntasChecagem,
    consultaSugerida: [
      textoExtraido.titulo,
      cidade,
      categoria,
      keywords.slice(0, 4).map((item) => item.termo).join(' '),
    ].filter(Boolean).join(' '),
    verificacoesExternas: {
      quantidade: factChecks.length,
      itens: factCheckSummary,
    },
  };
}

/**
 * Analisa o texto por heurísticas explicáveis.
 * A pontuação não substitui checagem jornalística, mas ajuda a priorizar risco.
 */
async function analyzeToxicity(text, context = {}) {
  try {
    const cleanText = normalizeText(text);
    const lowerText = cleanText.toLowerCase();
    const words = cleanText.split(/\s+/).filter(Boolean);
    const uppercaseWords = cleanText.match(/\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}\b/g) || [];
    const exclamationCount = countMatches(cleanText, /!/g);
    const linkCount = countMatches(cleanText, /https?:\/\/|www\./gi);
    const hasDate = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b/i.test(cleanText);
    const hasNamedSource = /\b(prefeitura|governo|secretaria|ministério|ministerio|universidade|hospital|polícia|policia|defesa civil|ibge|tribunal|câmara|camara)\b/i.test(cleanText);

    const checks = [
      {
        pattern: /\b(urgente|bomba|chocante|imperdível|imperdivel|alerta máximo|alerta maximo)\b/gi,
        weight: 14,
        description: 'Uso de palavras alarmistas ou sensacionalistas.',
      },
      {
        pattern: /\b(compartilhe|repasse|envie para todos|antes que apaguem|não deixe ninguém saber|nao deixe ninguem saber)\b/gi,
        weight: 18,
        description: 'Pedido de compartilhamento rápido, comum em boatos.',
      },
      {
        pattern: /\b(segredo|censurado|mídia não mostra|midia nao mostra|verdade escondida|eles não querem|eles nao querem)\b/gi,
        weight: 16,
        description: 'Apelo conspiratório ou alegação de informação escondida.',
      },
      {
        pattern: /\b(cura milagrosa|100% garantido|milagre|tratamento proibido|vacina mata|chip na vacina)\b/gi,
        weight: 20,
        description: 'Promessa extraordinária ou desinformação típica de saúde.',
      },
      {
        pattern: /\b(golpe|fraude nas urnas|prisão imediata|prisao imediata|estado de sítio|estado de sitio)\b/gi,
        weight: 14,
        description: 'Tema sensível apresentado com linguagem de alto impacto.',
      },
    ];

    let risk = 25;
    const sinais = [];

    checks.forEach((check) => {
      const hits = countMatches(cleanText, check.pattern);
      if (hits > 0) {
        risk += Math.min(check.weight * hits, check.weight + 10);
        sinais.push({
          tipo: 'risco',
          descricao: check.description,
          ocorrencias: hits,
          peso: check.weight,
        });
      }
    });

    if (uppercaseWords.length >= 3) {
      risk += 10;
      sinais.push({
        tipo: 'risco',
        descricao: 'Excesso de palavras em maiúsculas aumenta o tom emocional.',
        ocorrencias: uppercaseWords.length,
        peso: 10,
      });
    }

    if (exclamationCount >= 3) {
      risk += 8;
      sinais.push({
        tipo: 'risco',
        descricao: 'Muitos pontos de exclamação indicam apelo emocional.',
        ocorrencias: exclamationCount,
        peso: 8,
      });
    }

    if (words.length < 18) {
      risk += 12;
      sinais.push({
        tipo: 'risco',
        descricao: 'Texto muito curto dá pouco contexto para confirmar a informação.',
        ocorrencias: 1,
        peso: 12,
      });
    }

    if (hasNamedSource) {
      risk -= 12;
      sinais.push({
        tipo: 'positivo',
        descricao: 'Cita instituição ou fonte verificável.',
        ocorrencias: 1,
        peso: -12,
      });
    }

    if (hasDate) {
      risk -= 6;
      sinais.push({
        tipo: 'positivo',
        descricao: 'Contém referência temporal que facilita a checagem.',
        ocorrencias: 1,
        peso: -6,
      });
    }

    if (linkCount > 0) {
      risk -= 4;
      sinais.push({
        tipo: 'positivo',
        descricao: 'Inclui link ou referência externa para investigação.',
        ocorrencias: linkCount,
        peso: -4,
      });
    }

    if (context.cidade && lowerText.includes(String(context.cidade).replace(/-/g, ' ').toLowerCase())) {
      risk -= 4;
      sinais.push({
        tipo: 'positivo',
        descricao: 'O texto menciona a cidade selecionada, reforçando contexto regional.',
        ocorrencias: 1,
        peso: -4,
      });
    }

    risk = clamp(risk, 0, 100);
    const truthPercentage = clamp(Math.round(100 - risk));
    const veredito = getVerdict(truthPercentage);
    const nivelRisco = getRiskLevel(truthPercentage);
    const sinaisUnicos = uniqueByDescription(sinais);

    const recomendacoes = [
      'Procure a mesma informação em pelo menos duas fontes confiáveis.',
      'Confira data, autor, veículo e links citados antes de compartilhar.',
    ];

    if (!hasNamedSource) {
      recomendacoes.unshift('Busque uma fonte oficial ou veículo jornalístico que confirme a notícia.');
    }
    if (sinaisUnicos.some((sinal) => sinal.tipo === 'risco')) {
      recomendacoes.unshift('Evite compartilhar enquanto os sinais de risco não forem esclarecidos.');
    }

    return {
      porcentagemVerdade: truthPercentage,
      veredito,
      nivelRisco,
      resumo: `A análise classificou a notícia como "${veredito}" com risco ${nivelRisco}.`,
      sinais: sinaisUnicos,
      recomendacoes,
      metricas: {
        palavras: words.length,
        palavrasMaiusculas: uppercaseWords.length,
        exclamacoes: exclamationCount,
        links: linkCount,
        citaFonte: hasNamedSource,
        citaData: hasDate,
      },
      riskScore: Number((risk / 100).toFixed(2)),
      detalhes: [
        {
          aspect: 'Linguagem e tom',
          probability: clamp(100 - (uppercaseWords.length * 4) - (exclamationCount * 3)),
        },
        {
          aspect: 'Contexto e completude',
          probability: clamp(words.length >= 80 ? 85 : words.length >= 30 ? 70 : 45),
        },
        {
          aspect: 'Fontes verificáveis',
          probability: clamp((hasNamedSource ? 80 : 35) + (linkCount > 0 ? 10 : 0)),
        },
      ],
    };
  } catch (err) {
    console.error('Erro ao analisar toxicidade:', err.message);
    return {
      porcentagemVerdade: 50,
      detalhes: [
        { aspect: 'Análise indisponível', probability: 50 },
      ],
    };
  }
}

/**
 * Query Google Fact Check API
 */
async function getFactChecks(query, GOOGLE_API_KEY) {
  try {
    if (!GOOGLE_API_KEY) {
      console.warn('⚠️ GOOGLE_API_KEY não configurado, fact-checking desabilitado');
      return [];
    }

    const url = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';
    const response = await axios.get(url, {
      params: {
        query: query.substring(0, 500),
        pageSize: 5,
        key: GOOGLE_API_KEY,
      },
      timeout: 5000,
    });

    if (!response.data.claims) return [];

    return response.data.claims.map(claim => ({
      alegacao: claim.text || claim.claimReview?.[0]?.title || 'Sem descrição',
      avaliacao: claim.claimReview?.[0]?.textualRating || 'Não verificado',
      verificador: claim.claimReview?.[0]?.publisher?.name || 'Fonte desconhecida',
      autor: claim.claimReview?.[0]?.author?.name || 'Autor não informado',
      url_revisao: claim.claimReview?.[0]?.url || null,
      data: claim.claimReview?.[0]?.reviewDate || null,
    }));
  } catch (err) {
    console.error('Erro ao buscar fact-checks:', err.message);
    return [];
  }
}

function adjustWithFactChecks(analysis, factChecks) {
  if (!factChecks.length) return analysis;

  const ratings = factChecks.map((item) => String(item.avaliacao || '').toLowerCase()).join(' ');
  let adjustment = 0;
  if (/\bfals|fake|enganos|incorreto|mentira/.test(ratings)) adjustment -= 18;
  if (/verdad|correto|confirmado/.test(ratings)) adjustment += 14;

  if (adjustment === 0) return analysis;

  const score = clamp(analysis.porcentagemVerdade + adjustment);
  return {
    ...analysis,
    porcentagemVerdade: score,
    veredito: getVerdict(score),
    nivelRisco: getRiskLevel(score),
    resumo: `A análise encontrou checagens externas e classificou a notícia como "${getVerdict(score)}".`,
    sinais: [
      ...analysis.sinais,
      {
        tipo: adjustment > 0 ? 'positivo' : 'risco',
        descricao: adjustment > 0
          ? 'Checagens externas relacionadas indicam informação confirmada ou correta.'
          : 'Checagens externas relacionadas indicam informação falsa, incorreta ou enganosa.',
        ocorrencias: factChecks.length,
        peso: adjustment,
      },
    ],
  };
}

/**
 * Extract title and content from URL or text
 */
async function extractContent(texto, url, modo) {
  try {
    if (modo === 'link' && url) {
      const parsedUrl = new URL(url);
      try {
        const response = await axios.get(url, {
          timeout: 7000,
          maxContentLength: 1024 * 1024,
          headers: {
            'User-Agent': 'Mozilla/5.0 VerificaOeste/1.0',
            Accept: 'text/html,application/xhtml+xml',
          },
        });

        const $ = cheerio.load(response.data);
        $('script, style, noscript, svg').remove();

        const titulo =
          $('meta[property="og:title"]').attr('content') ||
          $('h1').first().text() ||
          $('title').text() ||
          `Análise da URL: ${parsedUrl.hostname}`;

        const description =
          $('meta[name="description"]').attr('content') ||
          $('meta[property="og:description"]').attr('content') ||
          '';

        const paragraphs = $('article p, main p, p')
          .map((_, el) => $(el).text())
          .get()
          .map(normalizeText)
          .filter((line) => line.length > 40)
          .slice(0, 12);

        const conteudo = normalizeText([description, ...paragraphs].join(' ')).substring(0, 4000);

        return {
          titulo: normalizeText(titulo).substring(0, 180),
          conteudo: conteudo || `Não foi possível extrair texto amplo de ${url}.`,
          url,
          dominio: parsedUrl.hostname,
          extracao: conteudo ? 'conteudo-extraido' : 'conteudo-limitado',
        };
      } catch (err) {
        return {
          titulo: `Análise da URL: ${parsedUrl.hostname}`,
          conteudo: `Não foi possível ler o conteúdo da página automaticamente. Link analisado: ${url}`,
          url,
          dominio: parsedUrl.hostname,
          extracao: 'falha-na-extracao',
          aviso: err.message,
        };
      }
    }

    // Para texto, usa os primeiros caracteres como título
    const lines = texto.split('\n').filter(l => l.trim());
    const titulo = lines[0]?.substring(0, 100) || 'Análise de texto';
    const conteudo = texto.substring(0, 500);

    return { titulo, conteudo };
  } catch (err) {
    console.error('Erro ao extrair conteúdo:', err.message);
    return {
      titulo: 'Conteúdo',
      conteudo: texto?.substring(0, 200) || 'Conteúdo não disponível',
    };
  }
}

/**
 * Main verification handler
 * POST /api/verificar
 */
async function verificar(req, res, next) {
  try {
    const { texto, link, cidade, categoria, modo } = req.body;
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    const textoExtraido = await extractContent(texto, link, modo);
    const conteudo = modo === 'texto' ? texto : `${textoExtraido.titulo}. ${textoExtraido.conteudo}`;
    if (!conteudo || conteudo.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Texto ou link inválido',
        },
      });
    }

    const [analiseBase, factChecks] = await Promise.all([
      analyzeToxicity(conteudo, { cidade, categoria, modo }),
      getFactChecks(conteudo, GOOGLE_API_KEY),
    ]);
    const analiseIA = adjustWithFactChecks(analiseBase, factChecks);
    const informacoes = buildImportantInfo({
      conteudo,
      textoExtraido,
      modo,
      link,
      cidade,
      categoria,
      analysis: analiseIA,
      factChecks,
    });

    // Formatar resposta conforme esperado pelo frontend
    const result = {
      sucesso: true,
      dados: {
        analiseIA,
        factChecks,
        informacoes,
        texto: textoExtraido,
        metadados: {
          modo,
          cidade,
          categoria,
          dataAnalise: new Date().toISOString(),
        },
      },
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro no verificador:', err);
    next(err);
  }
}

/**
 * Public health check para verificador
 */
async function statusVerificador(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      verificador: 'disponível',
      versao: '1.0.0',
    },
  });
}

module.exports = { verificar, statusVerificador };
