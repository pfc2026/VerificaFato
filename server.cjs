// server.cjs — ponto de entrada alternativo (CommonJS explícito).
// Usado quando package.json define "type": "module" mas server ainda precisa de CJS.
module.exports = require('./api/_app');
