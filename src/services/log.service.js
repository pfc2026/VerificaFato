const Log = require('../models/Log');

/**
 * Serviço de criação de logs.
 * Usado pelos controllers para registrar ações do usuário.
 */
async function createLog({ usuario, acao, ip, detalhes }) {
  return Log.create({ usuario, acao, ip, detalhes });
}

module.exports = { createLog };

