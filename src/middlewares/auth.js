import jwt from "jsonwebtoken";
import prisma from "../config/database.js";

// Este middleware verifica el token JWT en las solicitudes entrantes.
// Responde a la pregunta: ¿Quién eres?

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access token required." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId: decoded.tenantId,
          userId: decoded.userId,
        },
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            bio: true,
          },
        },
      },
    });

    if (!tenantUser) {
      return res.status(403).json({
        message: "User is not associated with this tenant",
      });
    }
    console.log("Authenticated Tenant User:", tenantUser);
    req.user = {
      id: tenantUser.user.id,
      tenantId: tenantUser.tenantId,
      roleName: tenantUser.role.name,
      username: tenantUser.user.username,
      email: tenantUser.user.email,
      name: tenantUser.user.name,
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

export default authenticateToken;
