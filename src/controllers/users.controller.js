const User = require('../models/User');

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, q, tipo, ativo } = req.query;

    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (ativo !== undefined) filter.ativo = String(ativo) === 'true';
    if (q) {
      filter.$or = [
        { nome: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { cpf: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, totalItems] = await Promise.all([
      User.find(filter).select('-senha').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / Number(limit))),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updates = {};

    for (const field of ['nome', 'cpf', 'tipo', 'ativo']) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-senha');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Usuário não encontrado' },
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { me, list, update };

