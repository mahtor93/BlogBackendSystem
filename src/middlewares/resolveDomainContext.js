// Este middleware resuelve el contexto del dominio basado en el encabezado de la solicitud.
// Responde a la pregunta: ¿Dónde estás actuando?

import prisma from "../config/database.js";

const resolveDomainContext = async (req, res, next) => {
  try {
    const rawHost =
      req.headers["x-tenant-domain"] ||
      req.headers.host;


    if (!rawHost) {
      return res.status(400).json({
        message: "Domain not provided",
      });
    }
    console.log("Raw Host:", rawHost);

    const domainName = rawHost
      .split(":")[0]
      .replace(/^www\./, "")
      .toLowerCase();
    console.log("Resolved Domain Name:", domainName);

    const domain = await prisma.domain.findUnique({
      where: { domain: domainName },
      select: {
        id: true,
        domain: true,
        tenant: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        blog: {
          select: {
            id: true,
            slug: true,
            name: true,
            isDefault: true,
          },
        },
      },
    });

    console.log("Domain found:", domain);

    if (!domain) {
      return res.status(404).json({
        message: "Domain not registered",
      });
    }

    if (!domain.tenant || !domain.blog) {
      return res.status(500).json({
        message: "Domain context misconfigured",
      });
    }

    req.context = {
      tenantId: domain.tenant.id,
      tenantName: domain.tenant.name,
      plan: domain.tenant.plan,

      blogId: domain.blog.id,
      blogSlug: domain.blog.slug,

      domainId: domain.id,
      domainName: domain.domain,
    };

    next();
  } catch (error) {
    console.error("resolveDomainContext error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export default resolveDomainContext;
