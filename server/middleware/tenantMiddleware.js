const tenantMiddleware = async (req, res, next) => {
  // Tenant is already set by authMiddleware from the JWT token
  if (!req.tenant) {
    return res.status(400).json({ success: false, message: 'Tenant context missing' });
  }
  next();
};

module.exports = tenantMiddleware;
