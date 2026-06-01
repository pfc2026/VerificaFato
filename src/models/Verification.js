const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documento: { type: String, required: true, trim: true, index: true },
    tipoDocumento: { type: String, required: true, trim: true, index: true },
    valido: { type: Boolean, default: null },
    observacao: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', VerificationSchema);

