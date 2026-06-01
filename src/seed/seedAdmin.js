const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getEnv } = require('../config/env');
const { createLog } = require('../services/log.service');

/**
 * Seed admin automático.
 *
 * Requisitos:
 * - SEED_ADMIN_EMAIL
 * - SEED_ADMIN_PASSWORD
 *
 * Se já existir admin, não recria.
 */
async function seedAdmin() {
  const env = getEnv();

  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    console.warn('⚠️ Seed admin ignorado: defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env.');
    return;
  }

  const existing = await User.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);

  const admin = await User.create({
    nome: 'Admin',
    email: env.SEED_ADMIN_EMAIL,
    senha: passwordHash,
    cpf: '',
    tipo: 'admin',
    ativo: true,
  });

  await createLog({
    usuario: admin._id,
    acao: 'SEED_ADMIN_CREATE',
    ip: 'seed',
    detalhes: { email: admin.email },
  });

  console.log('✅ Admin seed criado com sucesso:', admin.email);
}

module.exports = { seedAdmin };

