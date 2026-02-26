/**
 * Authorize specific roles
 * @param  {...string} roles - Allowed roles e.g. "doctor", "patient"
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user?.role}' is not authorized.`,
      });
    }
    next();
  };
};

export default authorizeRoles;