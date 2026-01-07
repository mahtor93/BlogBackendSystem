import bcrypt from "bcrypt";
import prisma from "../config/database.js";

export async function getMe(req, res) {
  try {
    const { tenantId } = req.context;
    const { id } = req.user;

    // 1. Validar pertenencia al tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        userId: id,
        tenantId,
        //deletedAt: null, // si usas soft delete
      },
      select: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            bio: true,
            avatarId: true,
            createdAt: true,
          },
        },
        role: {
          select: { name: true },
        },
      },
    });

    console.log("Fetched Tenant User for getMe:", tenantUser);

    if (!tenantUser) {
      return res.status(404).json({ message: "User not found in tenant." });
    }

    res.json({
      ...tenantUser.user,
      role: tenantUser.role.name,
      tenantId,
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Server Error ME-001" });
  }
}
export async function updateMe(req, res) {
  try {
    const {  tenantId } = req.context;
    const { id } = req.user;
    const { name, bio, email, username } = req.body;

    if (!id || !tenantId) {
      return res.status(400).json({ message: "Invalid context." });
    }

    // 1. Verificar pertenencia al tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        userId: id,
        // deletedAt: null, // solo si implementas soft delete aquí
      },
      select: { userId: true },
    });

    if (!tenantUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Construir payload
    const data = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (email !== undefined) data.email = email;
    if (username !== undefined) data.username = username;

    // 3. Actualizar User
    await prisma.user.update({
      where: { id },
      data,
    });

    res.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Update Me Error:", error);
    res.status(500).json({ message: "Server Error ME-UPD-001" });
  }
}
export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const { userId, tenantId } = req.context;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    // 1. Validar pertenencia al tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        userId,
        tenantId,
        deletedAt: null, // si usas soft delete
      },
      select: { userId: true },
    });

    if (!tenantUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. Obtener password actual
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 3. Validar password actual
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    // 4. Hashear y actualizar
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: "Server Error ME-PW-001" });
  }
}
export async function updateAvatar(req, res) {
  try {
    const { avatarId } = req.body;
    const { userId, tenantId } = req.context;

    if (!avatarId) {
      return res.status(400).json({ message: "Avatar ID is required." });
    }

    // 1. Validar pertenencia al tenant
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        userId,
        tenantId,
        deletedAt: null, // si usas soft delete
      },
      select: { userId: true },
    });

    if (!tenantUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2. (Opcional pero recomendado) Validar que el Media exista
    const mediaExists = await prisma.media.findUnique({
      where: { id: avatarId },
      select: { id: true },
    });

    if (!mediaExists) {
      return res.status(400).json({ message: "Invalid avatar reference." });
    }

    // 3. Actualizar avatar
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatarId },
      select: {
        id: true,
        username: true,
        avatarId: true,
      },
    });

    res.json({
      message: "Avatar updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update Avatar Error:", error);
    res.status(500).json({ message: "Server Error ME-AV-001" });
  }
}
export async function deleteMe(req, res) {
  try {
    const { userId, tenantId } = req.context;

    const deleted = await prisma.tenantUser.updateMany({
      where: {
        userId,
        tenantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "Account deactivated successfully." });
  } catch (error) {
    console.error("Delete Me Error:", error);
    res.status(500).json({ message: "Server Error ME-DEL-001" });
  }
}
