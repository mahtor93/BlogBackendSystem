import { Router } from "express";

import resolveDomainContext from "../middlewares/resolveDomainContext.js";
import authenticateToken from "../middlewares/auth.js";
import requireTenantMatch from "../middlewares/requireTenantMatch.js";

import {
  getMe,
  updateMe,
  updatePassword,
  deleteMe,
} from "../controllers/me.controller.js";

const meRouter = Router();

//Contexto del tenant (por dominio)

meRouter.use(resolveDomainContext);

//Autenticación JWT

meRouter.use(authenticateToken);

//Validar que el token corresponde al tenant activo

meRouter.use(requireTenantMatch);

// Rutas de identidad propia

meRouter.get("/", getMe);
meRouter.put("/", updateMe);
meRouter.patch("/password", updatePassword);
meRouter.delete("/", deleteMe);

export default meRouter;
