/**
 * SCRIPT DE TESTES COMPLETO
 * 
 * Testa todos os endpoints da API
 * Requer: MongoDB rodando em localhost:27017
 * 
 * Uso: node tests/testAPI.js
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// ==================== HELPERS ====================

function log(color, title, message = '') {
  console.log(`${color}[${title}]${colors.reset} ${message}`);
}

function success(title, message = '') {
  log(colors.green, '✅ PASS', `${title} - ${message}`);
  testResults.passed++;
}

function fail(title, message = '') {
  log(colors.red, '❌ FAIL', `${title} - ${message}`);
  testResults.failed++;
  testResults.errors.push({ title, message });
}

function info(title, message = '') {
  log(colors.cyan, 'ℹ️ INFO', `${title} - ${message}`);
}

function getErrorMessage(err) {
  if (err.response?.data) {
    return JSON.stringify(err.response.data);
  }

  return [err.code, err.message].filter(Boolean).join(' - ') || 'Erro desconhecido';
}

// ==================== TESTES ====================

async function testHealthCheck() {
  try {
    info('Health Check', 'Testando /api/health...');
    const response = await axios.get(`${BASE_URL}/api/health`);
    
    if (response.status === 200 && response.data.sucesso === true) {
      success('Health Check', 'API está respondendo corretamente');
    } else {
      fail('Health Check', `Status inesperado: ${response.status}`);
    }
  } catch (err) {
    fail('Health Check', getErrorMessage(err));
  }
}

async function testRegister() {
  try {
    info('Register', 'Testando POST /api/auth/register...');
    
    const userData = {
      nome: 'Usuário Teste',
      email: `teste_${Date.now()}@test.com`,
      senha: 'SenhaForte123!',
      cpf: '12345678900',
      tipo: 'usuario',
      ativo: true,
    };

    const response = await axios.post(`${BASE_URL}/api/auth/register`, userData);
    
    if (response.status === 201 && response.data.sucesso === true) {
      success('Register', `Usuário criado: ${response.data.dados.email}`);
      return response.data.dados;
    } else {
      fail('Register', `Status inesperado: ${response.status}`);
      return null;
    }
  } catch (err) {
    fail('Register', err.response?.data?.erro?.message || getErrorMessage(err));
    return null;
  }
}

async function testLogin(email, senha) {
  try {
    info('Login', `Testando POST /api/auth/login para ${email}...`);
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      senha,
    });

    if (response.status === 200 && response.data.sucesso === true) {
      success('Login', 'Token JWT recebido com sucesso');
      return response.data.dados.token;
    } else {
      fail('Login', `Status inesperado: ${response.status}`);
      return null;
    }
  } catch (err) {
    fail('Login', err.response?.data?.erro?.message || getErrorMessage(err));
    return null;
  }
}

async function testGetMe(token) {
  try {
    info('Get Me', 'Testando GET /api/auth/me com JWT...');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200 && response.data.sucesso === true) {
      success('Get Me', `Dados do usuário: ${response.data.dados.email}`);
      return response.data.dados;
    } else {
      fail('Get Me', `Status inesperado: ${response.status}`);
      return null;
    }
  } catch (err) {
    fail('Get Me', err.response?.data?.erro?.message || getErrorMessage(err));
    return null;
  }
}

async function testVerificar() {
  try {
    info('Verificador', 'Testando POST /api/verificar (endpoint público)...');
    
    const testCases = [
      {
        modo: 'texto',
        texto: 'A prefeitura de Cascavel anunciou novos investimentos em infraestrutura urbana.',
        cidade: 'cascavel',
        categoria: 'política',
      },
      {
        modo: 'link',
        link: 'https://example.com/noticia-fake',
        cidade: 'foz-do-iguacu',
        categoria: 'geral',
      },
    ];

    for (const testCase of testCases) {
      try {
        const response = await axios.post(`${BASE_URL}/api/verificar`, testCase);
        
        if (response.status === 200 && response.data.sucesso === true) {
          success(
            'Verificador',
            `${testCase.modo} analisado: ${response.data.dados.analiseIA.porcentagemVerdade}% confiança`
          );
        } else {
          fail('Verificador', `Status inesperado: ${response.status}`);
        }
      } catch (err) {
        fail('Verificador', `${testCase.modo}: ${err.response?.data?.erro?.message || getErrorMessage(err)}`);
      }
    }
  } catch (err) {
    fail('Verificador', getErrorMessage(err));
  }
}

async function testVerificacoes(token) {
  try {
    info('Verificações', 'Testando CRUD de verificações...');
    
    // CREATE
    const createResponse = await axios.post(
      `${BASE_URL}/api/verifications`,
      {
        documento: 'DOC123456',
        tipoDocumento: 'CNH',
        valido: true,
        observacao: 'Documento válido',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (createResponse.status === 201 && createResponse.data.sucesso === true) {
      success('Verificações (CREATE)', 'Verificação criada com sucesso');
      
      const verificacaoId = createResponse.data.dados._id;
      
      // READ
      const readResponse = await axios.get(`${BASE_URL}/api/verifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (readResponse.status === 200 && readResponse.data.sucesso === true) {
        success('Verificações (READ)', `${readResponse.data.dados.items.length} verificações encontradas`);
      }

      // UPDATE
      const updateResponse = await axios.patch(
        `${BASE_URL}/api/verifications/${verificacaoId}`,
        { observacao: 'Atualizado com sucesso' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updateResponse.status === 200 && updateResponse.data.sucesso === true) {
        success('Verificações (UPDATE)', 'Verificação atualizada com sucesso');
      }
    } else {
      fail('Verificações (CREATE)', `Status inesperado: ${createResponse.status}`);
    }
  } catch (err) {
    fail('Verificações', err.response?.data?.erro?.message || getErrorMessage(err));
  }
}

async function testSearch(token) {
  try {
    info('Search', 'Testando pesquisas de notícias...');
    
    const saveResponse = await axios.post(
      `${BASE_URL}/api/search`,
      {
        modo: 'texto',
        texto: 'Notícia de teste',
        resultado: { veredito: 'verdadeiro', porcentagem: 85 },
        cidade: 'cascavel',
        categoria: 'política',
        analiseIA: { porcentagemVerdade: 85 },
        factChecks: [],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (saveResponse.status === 201 && saveResponse.data.sucesso === true) {
      success('Search (SAVE)', 'Pesquisa salva com sucesso');
      
      // LIST
      const listResponse = await axios.get(`${BASE_URL}/api/search`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (listResponse.status === 200 && listResponse.data.sucesso === true) {
        success('Search (LIST)', `${listResponse.data.dados.items.length} pesquisas encontradas`);
      }
    } else {
      fail('Search (SAVE)', `Status inesperado: ${saveResponse.status}`);
    }
  } catch (err) {
    fail('Search', err.response?.data?.erro?.message || getErrorMessage(err));
  }
}

async function testSwagger() {
  try {
    info('Swagger', 'Verificando documentação Swagger...');
    
    const response = await axios.get(`${BASE_URL}/api-docs`);
    
    if (response.status === 200) {
      success('Swagger', 'Documentação Swagger acessível em /api-docs');
    } else {
      fail('Swagger', `Status inesperado: ${response.status}`);
    }
  } catch (err) {
    fail('Swagger', getErrorMessage(err));
  }
}

// ==================== MAIN ====================

async function runAllTests() {
  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log('    TESTES COMPLETOS DA API - VerificaOeste-Parana');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);

  // Teste 1: Health Check
  await testHealthCheck();

  // Teste 2: Swagger
  await testSwagger();

  // Teste 3: Register
  const user = await testRegister();
  if (!user) {
    log(colors.yellow, '⚠️ WARNING', 'Não será possível testar endpoints autenticados sem usuário');
  }

  // Teste 4: Login e obter token
  let token = null;
  if (user) {
    token = await testLogin(user.email, 'SenhaForte123!');
  }

  // Testes autenticados (requerem token)
  if (token) {
    await testGetMe(token);
    await testVerificacoes(token);
    await testSearch(token);
  }

  // Teste público
  await testVerificar();

  // ==================== RELATÓRIO FINAL ====================

  console.log(`\n${colors.blue}${'='.repeat(60)}`);
  console.log('                    RELATÓRIO FINAL');
  console.log(`${'='.repeat(60)}${colors.reset}`);

  console.log(`${colors.green}✅ Testes Passaram: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Testes Falharam: ${testResults.failed}${colors.reset}`);

  if (testResults.errors.length > 0) {
    console.log(`\n${colors.red}Erros encontrados:${colors.reset}`);
    testResults.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.title}: ${err.message}`);
    });
  }

  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? Math.round((testResults.passed / totalTests) * 100) : 0;

  console.log(`\n${colors.cyan}Taxa de Sucesso: ${successRate}%${colors.reset}\n`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// ==================== INÍCIO ====================

// Aguarda 1 segundo para o servidor estar pronto
setTimeout(runAllTests, 1000);
