import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/database.js";


const login = async (req, res) => {
  try {
    let { username, password } = req.body;
    const tenantId = req.context?.tenantId;

    username = username?.toLowerCase();


    if (!tenantId) {
      return res.status(400).json({ message: "Tenant context required" });
    }

    // 1. Usuario global
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }, // permite login con email
        ],
      },
    });

    const TenantUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        user:{
          id: user?.id,
          deletedAt: null, // si usas soft delete
        }
      },
      include:{
        role:{
          select:{ name:true }
        }
      }
    });

    console.log("Fetched Tenant User for login:", TenantUser);

    if (!TenantUser) {
      return res
        .status(403)
        .json({ message: "User does not belong to this tenant" });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Relación tenant-user + rol
    const tenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
      include: {
        role: {
          select: { name: true },
        },
      },
    });

    if (!tenantUser) {
      return res
        .status(403)
        .json({ message: "User does not belong to this tenant" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // 4. Token contextual
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId,
        role: tenantUser.role.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: tenantUser.role.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error AU-LG001" });
  }
};

export { login };
