const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

DepartmentSchema.index({ code: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model('Department', DepartmentSchema);
