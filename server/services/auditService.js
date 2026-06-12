const AuditLog = require('../models/AuditLog');

const log = async ({ user, action, details, ipAddress, tenant }) => {
  try {
    await AuditLog.create({ user, action, details, ipAddress, tenant });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

const getAuditLogs = async (tenantId, limit = 100) => {
  return await AuditLog.find({ tenant: tenantId })
    .populate('user', 'email role')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = { log, getAuditLogs };
