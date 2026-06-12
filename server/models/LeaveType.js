const mongoose = require('mongoose');

const LeaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'Casual', 'Sick'
  maxDays: { type: Number, default: 12 },
  isPaid: { type: Boolean, default: true },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', LeaveTypeSchema);
