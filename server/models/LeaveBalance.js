const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  casual: { type: Number, default: 12 },
  sick: { type: Number, default: 10 },
  earned: { type: Number, default: 15 },
  unpaid: { type: Number, default: 0 },
  year: { type: Number, default: () => new Date().getFullYear() },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

LeaveBalanceSchema.index({ employee: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
