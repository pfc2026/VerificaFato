const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getEnv } = require('../config/env');
const { createLog } = require('../services/log.service');

/**
 * Auth controller: register + login.
 *
 * Mantém lógica de segurança centralizada em services e usa modelos para persistir.
 */
async function register(req, res, next) {
  try {
    const { nome, senha, cpf } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email já cadastrado' },
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(senha, saltRounds);

    const user = await User.create({
      nome,
      email,
      senha: passwordHash,
      cpf,
      tipo: 'usuario',
      ativo: true,
    });

    await createLog({
      usuario: user._id,
      acao: 'USER_REGISTER',
      ip: req.ip,
      detalhes: { email: user.email },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        tipo: user.tipo,
        ativo: user.ativo,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email já cadastrado' },
      });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const env = getEnv();
    const { senha } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' },
      });
    }

    if (!user.ativo) {
      return res.status(403).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'Usuário inativo' },
      });
    }

    const isValid = await bcrypt.compare(senha, user.senha);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' },
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        tipo: user.tipo,
      },
      env.JWT_SECRET,
      {
        subject: user._id.toString(),
        expiresIn: env.JWT_EXPIRES_IN,
      }
    );

    await createLog({
      usuario: user._id,
      acao: 'USER_LOGIN',
      ip: req.ip,
      detalhes: { email: user.email },
    });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          nome: user.nome,
          email: user.email,
          cpf: user.cpf,
          tipo: user.tipo,
          ativo: user.ativo,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nome: user.nome,
        email: user.email,
        cpf: user.cpf,
        tipo: user.tipo,
        ativo: user.ativo,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };


