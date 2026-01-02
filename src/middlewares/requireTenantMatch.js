
// Este middleware asegura que el usuario autenticado pertenece al tenant correcto en el contexto de la solicitud.
// responde a la pregunta ¿Puedes actuar aquí?
// requireTenantMatch.js
const requireTenantMatch = (req, res, next) => {
  if (!req.user || !req.context) {
    return res.status(500).json({
      message: "Authorization context missing",
    });
  }

  if (req.user.tenantId !== req.context.tenantId) {
    return res.status(403).json({
      message: "Forbidden: tenant mismatch",
    });
  }

  next();
};

export default requireTenantMatch;
