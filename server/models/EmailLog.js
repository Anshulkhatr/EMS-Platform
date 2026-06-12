const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    recipientType: {
      type: String,
      enum: ['all', 'role', 'individual'],
      required: true,
    },
    role: { type: String },
    recipients: [{ type: String }],
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['sent', 'partial', 'failed'],
      default: 'sent',
    },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailLog', EmailLogSchema);
