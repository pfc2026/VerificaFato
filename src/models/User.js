const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    senha: { type: String, required: true },
    cpf: { type: String, trim: true, index: true },
    tipo: { type: String, enum: ['admin', 'usuario'], default: 'usuario', index: true },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

