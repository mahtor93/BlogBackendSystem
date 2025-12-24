import { Router } from "express";
import { createPost, addPostMedia, addPostTags } from "../controllers/posts.controller.js";
import authenticateToken from "../middlewares/auth.js";

const postRouter = Router();
const postPublicRouter = Router();
const postPrivateRouter = Router();

postPrivateRouter.use(authenticateToken);

/* RUTAS PUBLICAS */


/* RUTAS PRIVADAS */
postPrivateRouter.post("/posts", createPost);
postPrivateRouter.post("/posts/:id/media", addPostMedia);
postPrivateRouter.post("/post/:id/tags", addPostTags);

/* UNIFICACIÓN DE RUTAS */
postRouter.use("/", postPublicRouter);
postRouter.use("/", postPrivateRouter);
export default postRouter;