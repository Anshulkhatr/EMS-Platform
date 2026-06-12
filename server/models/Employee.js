const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true }, // generated automatically, e.g. EMP0001
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, required: true },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  phone: { type: String },
  salary: { type: Number },
  currency: { type: String, default: 'USD' },
  dateOfJoining: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Suspended', 'Terminated'], default: 'Active' },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  }
}, { timestamps: true });

EmployeeSchema.index({ employeeId: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
