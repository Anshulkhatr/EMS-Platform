const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, unique: true, sparse: true },
  isActive: { type: Boolean, default: true },
  settings: {
    theme: { type: String, default: 'dark' },
    mfaRequired: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', TenantSchema);
