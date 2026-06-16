/**
 * dev-server.js
 * 
 * Servidor de desenvolvimento simples para testar o frontend
 * sem precisar de MongoDB rodando.
 * 
 * Uso: node dev-server.js
 * Acesso: http://localhost:3000
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Mock API endpoints
app.post('/api/verificar', (req, res) => {
  const { texto, link } = req.body;
  
  console.log('📋 Verificação recebida:', { texto: texto?.substring(0, 50), link });
  
  // Resposta simulada
  res.json({
    sucesso: true,
    resultado: {
      veredito: 'Análise necessária',
      confianca: 0.65,
      sinais: [
        'Linguagem neutra',
        'Sem palavras alarmistas',
        'Fonte identificada'
      ]
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Simular usuário não autenticado
  res.status(401).json({
    sucesso: false,
    erro: { code: 'UNAUTHORIZED', message: 'Não autenticado' }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('🔐 Login attempt:', email);
  
  res.json({
    sucesso: true,
    token: 'dev-token-' + Date.now(),
    usuario: { email, nome: 'Usuário Dev' }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, senha } = req.body;
  console.log('📝 Register attempt:', email);
  
  res.json({
    sucesso: true,
    usuario: { email, nome: 'Novo Usuário' }
  });
});

app.get('/api/search', (req, res) => {
  res.json({
    sucesso: true,
    resultados: [
      { titulo: 'Notícia 1', descricao: 'Resultado de teste', veredito: 'Verificada' }
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ sucesso: true, status: 'ok', mode: 'development' });
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  🚀 VerificaFato - Dev Server              ║
╠════════════════════════════════════════════╣
║  URL: http://localhost:${PORT}             ║
║  Modo: DESENVOLVIMENTO (sem MongoDB)       ║
║  APIs: Simuladas para testes               ║
╚════════════════════════════════════════════╝
  `);
});
