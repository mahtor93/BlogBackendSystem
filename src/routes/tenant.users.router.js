import { Router } from "express";
import {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  getUserByUsername,
  getUserById,
} from "../controllers/tenant.users.controller.js";
import resolveDomainContext from "../middlewares/resolveDomainContext.js";
import authenticateToken from "../middlewares/auth.js";
import requireTenantMatch from "../middlewares/requireTenantMatch.js";
import requireRole from "../middlewares/requireRole.js";

const ROLES = ["OWNER", "ADMIN"];

const usersRouter = Router();
usersRouter.use(resolveDomainContext, authenticateToken, requireTenantMatch);

usersRouter.post("/", 
    requireRole(ROLES), 
    createUser
);

usersRouter.get("/", 
    requireRole(ROLES), 
    listUsers
);

usersRouter.get(
  "/by-username/:username",
  requireRole(ROLES),
  getUserByUsername
);

usersRouter
  .route("/:userId")
  .get(requireRole(ROLES), getUserById)
  .put(requireRole(ROLES), updateUser)
  .delete(requireRole(["OWNER"]), deleteUser);

export default usersRouter;
