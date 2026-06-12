const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  presentDays: { type: Number, default: 0 },
  totalWorkingDays: { type: Number, default: 22 },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, required: true },
  status: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

PayrollSchema.index({ employee: 1, month: 1, year: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
