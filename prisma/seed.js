import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Crear Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: "Tenant Demo",
      plan: "FREE",
    },
  });

  // 2. Crear Blog por defecto
  const blog = await prisma.blog.create({
    data: {
      name: "Blog Principal",
      slug: "main",
      description: "Blog por defecto del tenant",
      isDefault: true,
      tenantId: tenant.id,
    },
  });



  // 3. Crear Usuario OWNER
  const passwordHash = await bcrypt.hash("$Init2026&End2026.", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      username: "admin",
      password: passwordHash,
      name: "Admin Demo",
      tenantId: tenant.id,
    },
  });

  // 4. Crear Dominio local (opcional pero recomendado)
  await prisma.domain.create({
    data: {
      domain: "localhost",
      tenantId: tenant.id,
      blogId: blog.id,
    },
  });

  console.log("Seed completed");
  console.log({
    tenantId: tenant.id,
    blogId: blog.id,
    userId: user.id,
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
