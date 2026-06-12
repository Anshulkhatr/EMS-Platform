const AuditLog = require('../models/AuditLog');

const auditMiddleware = (action) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            user: req.user._id,
            action: action || `${req.method} ${req.originalUrl}`,
            details: JSON.stringify(req.body || {}),
            ipAddress: req.ip || req.headers['x-forwarded-for'],
            tenant: req.tenant
          });
        } catch (err) {
          console.error('AuditLog error:', err.message);
        }
      }
    });
    next();
  };
};

module.exports = auditMiddleware;
