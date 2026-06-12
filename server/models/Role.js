const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. 'Admin', 'Manager'
  permissions: [{ type: String }],        // e.g. ['create_employee', 'view_reports']
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
