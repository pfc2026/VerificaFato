const Log = require('../models/Log');

async function list(req, res, next) {
  try {
    const { page = 1, limit = 10, usuario, acao, q } = req.query;

    const filter = {};
    if (usuario) filter.usuario = usuario;
    if (acao) filter.acao = { $regex: acao, $options: 'i' };

    if (q) {
      filter.$or = [
        { ip: { $regex: q, $options: 'i' } },
        { detalhes: { $regex: q, $options: 'i' } },
        { acao: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, totalItems] = await Promise.all([
      Log.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Log.countDocuments(filter),
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

module.exports = { list };

