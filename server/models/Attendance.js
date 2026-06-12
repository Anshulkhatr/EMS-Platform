const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  punchIn: { type: Date },
  punchOut: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half-Day', 'On-Leave'], default: 'Absent' },
  workHours: { type: Number, default: 0 }, // in hours
  regularization: {
    requested: { type: Boolean, default: false },
    reason: String,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    originalPunchIn: Date,
    originalPunchOut: Date
  },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
