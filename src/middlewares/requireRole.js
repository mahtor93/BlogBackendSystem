const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user?.roleName) {
      return res.status(403).json({
        message: "Role not assigned",
      });
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export default requireRole;
