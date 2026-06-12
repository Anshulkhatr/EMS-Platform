const mongoose = require('mongoose');

const LeavePolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  leaveTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' }],
  applicableTo: { type: String, enum: ['All', 'Manager', 'Employee', 'HR'], default: 'All' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('LeavePolicy', LeavePolicySchema);
