const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['Leave', 'Attendance', 'Document'] },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ref to LeaveRequest or Attendance
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  remarks: { type: String },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Approval', ApprovalSchema);
