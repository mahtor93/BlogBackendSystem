import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.$transaction(async (tx) => {
    // 1. Tenant
    const tenant = await tx.tenant.create({
      data: {
        name: "Tenant Demo",
        plan: "FREE",
      },
    });

    // 2. Roles del tenant
    await tx.userRole.createMany({
      data: [
        { name: "OWNER", tenantId: tenant.id },
        { name: "ADMIN", tenantId: tenant.id },
        { name: "EDITOR", tenantId: tenant.id },
        { name: "AUTHOR", tenantId: tenant.id },
        { name: "BLANK", tenantId: tenant.id },
      ],
    });

    const ownerRole = await tx.userRole.findUnique({
      where: {
        tenantId_name: {
          tenantId: tenant.id,
          name: "OWNER",
        },
      },
    });

    // 3. Blog por defecto
    const blog = await tx.blog.create({
      data: {
        name: "Blog Principal",
        slug: "main",
        description: "Blog por defecto del tenant",
        isDefault: true,
        tenantId: tenant.id,
      },
    });

    // 4. Dominio
    await tx.domain.create({
      data: {
        domain: "localhost",
        tenantId: tenant.id,
        blogId: blog.id,
      },
    });

    // 5. Usuario
    const passwordHash = await bcrypt.hash("$Init2026&End2026.", 10);

    const user = await tx.user.create({
      data: {
        email: "admin@demo.com",
        username: "admin",
        password: passwordHash,
        name: "Admin Demo",
      },
    });

    // 6. Relación TenantUser + rol
    await tx.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: ownerRole.id,
      },
    });

    console.log("Seed completed successfully");
  });
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
