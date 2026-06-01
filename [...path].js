// api/[...path].js
// Handler serverless para o Vercel.
// Importa o app Express (sem chamar .listen()) e o exporta como função.

const app = require('./_app');

module.exports = app;
