// server.js
// - Local (node server.js / nodemon): inicia o servidor HTTP na porta definida.
// - Vercel/serverless: o handler é api/[...path].js — este arquivo não é chamado.

'use strict';

const app  = require('./api/_app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📖 Swagger em http://localhost:${PORT}/api-docs`);
});
