const Verification = require('../models/Verification');

async function create(req, res, next) {
  try {
    const { documento, tipoDocumento, valido = undefined, observacao } = req.body;

    const verification = await Verification.create({
      usuario: req.user.id,
      documento,
      tipoDocumento,
      valido,
      observacao,
    });

    return res.status(201).json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, usuario, tipoDocumento, valido, q } = req.query;

    const filter = {};

    // Regra: usuário comum só enxerga seus próprios registros
    // Admin pode filtrar por usuario.
    if (req.user.tipo !== 'admin') {
      filter.usuario = req.user.id;
    } else if (usuario) {
      filter.usuario = usuario;
    }

    if (tipoDocumento) filter.tipoDocumento = { $regex: tipoDocumento, $options: 'i' };
    if (valido !== undefined) filter.valido = String(valido) === 'true';
    if (q) {
      filter.$or = [
        { documento: { $regex: q, $options: 'i' } },
        { observacao: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, totalItems] = await Promise.all([
      Verification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Verification.countDocuments(filter),
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

    if (req.body.valido !== undefined) updates.valido = req.body.valido;
    if (req.body.observacao !== undefined) updates.observacao = req.body.observacao;

    // Usuário não-admin só atualiza registros dele
    const filter = { _id: id };
    if (req.user.tipo !== 'admin') filter.usuario = req.user.id;

    const verification = await Verification.findOneAndUpdate(filter, updates, { new: true });

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Verificação não encontrada' },
      });
    }

    return res.status(200).json({ success: true, data: verification });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, update };

