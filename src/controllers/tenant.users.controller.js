import bcrypt from "bcrypt";
import prisma from "../config/database.js";

export async function createUser(req, res) {
  try {
    const { username, email, password, name } = req.body;
    const tenantId = req.context?.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant context required." });
    }

    // 1. Usuario global (email / username únicos globalmente)
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Crear usuario si no existe
    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          name,
        },
      });
    }

    // 3. Verificar que NO esté ya asociado al tenant
    const existingTenantUser = await prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (existingTenantUser) {
      return res.status(409).json({
        message: "User already belongs to this tenant",
      });
    }

    // 4. Rol BLANK del tenant
    const defaultRole = await prisma.userRole.findFirst({
      where: {
        tenantId,
        name: "BLANK",
      },
    });

    if (!defaultRole) {
      return res.status(500).json({
        message: "Default role BLANK not configured for tenant",
      });
    }

    // 5. Vincular usuario al tenant
    await prisma.tenantUser.create({
      data: {
        tenantId,
        userId: user.id,
        roleId: defaultRole.id,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      userId: user.id,
      role: defaultRole.name,
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ message: "Server Error T-US001" });
  }
}
export async function listUsers(req, res) {
  try {
    const tenantId = req.context.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }
    const users = await prisma.user.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    res.json(
      users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    console.error("List Users Error:", error);
    res.status(500).json({ message: "Server Error T-US002" });
  }
}
export async function getUserByUsername(req, res) {
  try {
    const { username } = req.params;
    const tenantId = req.context.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }
    const user = await prisma.user.findUnique({
      where: { username, tenantId },
      select: {
        name: true,
        bio: true,
        avatarId: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("Get User By Name Error:", error);
    res.status(500).json({ message: "Server Error T-US005" });
  }
}
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.context.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }
    const user = await prisma.user.findUnique({
      where: { id, tenantId },
      select: {
        name: true,
        bio: true,
        avatarId: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: "Server Error T-US006" });
  }
}
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, bio, avatarId, password } = req.body;
    const tenantId = req.context.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (avatarId !== undefined) data.avatarId = avatarId;
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const update = await prisma.user.update({
      where: { id_tenantId: { id: parseInt(id), tenantId } },
      data,
    });

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server Error T-US003" });
  }
}
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const tenantId = req.context.tenantId;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.tenantUser.delete({
        where: {
          tenantId_userId: {
            tenantId,
            userId,
          },
        },
      });

      await tx.user.delete({
        where: { id: userId },
      });
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server Error T-US004" });
  }
}
