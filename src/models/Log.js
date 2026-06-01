const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    acao: { type: String, required: true, trim: true, index: true },
    ip: { type: String, required: false, trim: true },
    detalhes: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', LogSchema);

