// Registrar un nuevo tenant junto con su usuario administrador, blog y dominio por defecto
// Este Controller crea un kit básico que consiste en:
// - Un Tenant
// - Un Usuario administrador asociado al Tenant
// - Un Blog por defecto asociado al Tenant
// - Un Dominio por defecto asociado al Blog y al Tenant

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import prisma from "../config/database.js";

// Registrar un nuevo tenant junto con su usuario administrador, blog y dominio por defecto
const normalizeSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const registerTenant = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenantName, username, email, password } = req.body;

    const tenantSlug = normalizeSlug(tenantName);
    const domainName = `${tenantSlug}.localhost`;

    // Colisión de dominio
    const existingDomain = await prisma.domain.findUnique({
      where: { domain: domainName },
    });

    if (existingDomain) {
      return res.status(409).json({
        message: "Tenant name already in use",
      });
    }

    // Colisión de usuario global (MVP)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already in use",
      });
    }

    const { tenant, blog, user, ownerRole } =
      await prisma.$transaction(async (tx) => {
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Tenant
        const tenant = await tx.tenant.create({
          data: {
            name: tenantName,
            plan: "FREE",
          },
        });

        // 2. Roles base
        await tx.userRole.createMany({
          data: [
            { name: "OWNER", tenantId: tenant.id },
            { name: "ADMIN", tenantId: tenant.id },
            { name: "EDITOR", tenantId: tenant.id },
            { name: "AUTHOR", tenantId: tenant.id },
            { name: "BLANK", tenantId: tenant.id },
          ],
        });

        const ownerRole = await tx.userRole.findFirst({
          where: {
            tenantId: tenant.id,
            name: "OWNER",
          },
        });

        // 3. Blog por defecto
        const blog = await tx.blog.create({
          data: {
            name: "Mi Blog",
            slug: "main",
            isDefault: true,
            tenantId: tenant.id,
          },
        });

        // 4. Dominio
        await tx.domain.create({
          data: {
            domain: domainName,
            tenantId: tenant.id,
            blogId: blog.id,
          },
        });

        // 5. Usuario OWNER
        const user = await tx.user.create({
          data: {
            username,
            email,
            password: hashedPassword,
            name: username,
          },
        });

        await tx.tenantUser.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            roleId: ownerRole.id,
          },
        });
        
        return { tenant, blog, user, ownerRole };
      });

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: tenant.id,
        blogId: blog.id,
        role: ownerRole.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    res.status(201).json({
      message: "Tenant created successfully",
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        roleId: ownerRole.id,
      },
      blog: {
        id: blog.id,
        slug: blog.slug,
      },
      domain: domainName,
    });
  } catch (error) {
    console.error("RegisterTenant Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { registerTenant };

/*

PAYLOAD ESPERADO

{
  "tenantName": "Mi Empresa",
  "username": "admin",
  "email": "admin@miempresa.com",
  "password": "********"
}


PAYLOAD A FUTURO:

{
    "TenantName":"Mi empresa".
    "owner":{
        "username":"admin",
        "email":"admin@miempresa.com",
        "password":"********"
    }
}
*/
