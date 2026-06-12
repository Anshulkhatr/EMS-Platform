const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "General Shift", "Night Shift"
  startTime: { type: String, required: true }, // HH:MM (e.g. "09:00")
  endTime: { type: String, required: true }, // HH:MM (e.g. "18:00")
  gracePeriod: { type: Number, default: 15 }, // minutes
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Shift', ShiftSchema);
