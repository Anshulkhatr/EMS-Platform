const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

const authorizeSelfOrRoles = (paramName, ...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    const targetId = req.params[paramName];
    const userEmployeeId = req.user.employeeProfile?._id?.toString() || req.user.employeeProfile?.toString();

    if (userEmployeeId && targetId === userEmployeeId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have permission to access this resource.`
    });
  };
};

module.exports = { authorize, authorizeSelfOrRoles };

