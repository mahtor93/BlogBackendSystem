import bcrypt from "bcrypt";
import prisma from "../config/database.js";
import { selectFields } from "express-validator/lib/field-selection.js";
import e from "cors";

export async function createUser(req, res) {
  try {
    let { username, email, password, name } = req.body;
    const tenantId = req.context?.tenantId;

    username = username?.toLowerCase();
    email = email?.toLowerCase();
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
    const tenantUsers = await prisma.tenantUser.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    res.json(
      tenantUsers.map((tu) => ({
        id: tu.user.id,
        username: tu.user.username,
        email: tu.user.email,
        name: tu.user.name,
        role: tu.role.name,
        createdAt: tu.user.createdAt,
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
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId, user: { username } },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatarId: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!tenantUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      id: tenantUser.user.id,
      username: tenantUser.user.username,
      name: tenantUser.user.name,
      bio: tenantUser.user.bio,
      avatarId: tenantUser.user.avatarId,
      role: tenantUser.role.name,
      tenantId: tenantUser.tenantId,
    });
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
    const tenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId, userId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatarId: true,
            createdAt: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!tenantUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({
      id: tenantUser.user.id,
      username: tenantUser.user.username,
      name: tenantUser.user.name,
      bio: tenantUser.user.bio,
      avatarId: tenantUser.user.avatarId,
      role: tenantUser.role.name,
      tenantId: tenantUser.tenantId,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: "Server Error T-US006" });
  }
}
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    let { name, bio, avatarId, password, email, username } = req.body;
    const tenantId = req.context.tenantId;

    email = email?.toLowerCase();
    username = username?.toLowerCase();

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required." });
    }

    const tenantUser = await prisma.tenantUser.findFirst({
      where: { tenantId, userId:id },
        select:{
          userId: id,
        },
        select:{
          userId:true
        }
      });

    if (!tenantUser) {
      return res.status(404).json({ message: "User not found in tenant." });
    }

    const data = {};
    if (username !== undefined) data.username = username;
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (avatarId !== undefined) data.avatarId = avatarId;
    if (email !== undefined) data.email = email;

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const updateUser = await prisma.user.update({
      where: { id: tenantUser.userId },
      data,
      select:{
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatarId: true,
        createdAt: true,

      }
    });

    res.json({ message: "User updated successfully", user: updateUser });
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
            userId: id,
          },
        },
      });

      await tx.user.delete({
        where: { id: id },
      });
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server Error T-US004" });
  }
}
