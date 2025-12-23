import { Router } from "express";
import  authenticateToken from "../middlewares/auth.js";
import { getMe, updateMe,updatePassword } from "../controllers/me.controller.js";

const meRouter = Router();

meRouter.use(authenticateToken);

meRouter.get("/", getMe);
meRouter.patch("/", updateMe);
meRouter.patch("/password", updatePassword);

export default meRouter;