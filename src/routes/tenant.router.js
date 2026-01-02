import { Router } from "express";
import { registerTenant } from "../controllers/tenant.controller.js";

const tenantRouter = Router();

tenantRouter.post("/register", registerTenant);

export default tenantRouter;