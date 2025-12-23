import { Router } from "express"
import { getPostsByUserName, getUserByName } from "../controllers/users.controller.js";

const usersRouter = Router();

usersRouter.get("/:username", getUserByName);
usersRouter.get("/:username/posts", getPostsByUserName);
export default usersRouter;