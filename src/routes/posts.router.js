import { Router } from "express";
import { 
    createPost, 
    addPostMedia, 
    addPostTags, 
    updatePostStatus, 
    getPublishedPostsByUser, 
    getPostList,
    updatePostTags,
    updatePostMedia,
    updatePost } from "../controllers/posts.controller.js";
import authenticateToken from "../middlewares/auth.js";

const postRouter = Router();
const postPublicRouter = Router();
const postPrivateRouter = Router();

postPrivateRouter.use(authenticateToken);

/* RUTAS PUBLICAS */
postPublicRouter.get("/published/:userId", getPublishedPostsByUser); //

/* RUTAS PRIVADAS */
postPrivateRouter.post("/", createPost); //
postPrivateRouter.post("/media/:id", addPostMedia);
postPrivateRouter.post("/tags/:id", addPostTags); //

postPrivateRouter.patch("/status/:id", updatePostStatus); //
postPrivateRouter.patch("/tags/:id", updatePostTags);
postPrivateRouter.patch("/media/:id", updatePostMedia);
postPrivateRouter.patch("/:id", updatePost);

postPrivateRouter.get("/", getPostList); //

/* UNIFICACIÓN DE RUTAS */
postRouter.use("/public", postPublicRouter);
postRouter.use("/", postPrivateRouter);
export default postRouter;