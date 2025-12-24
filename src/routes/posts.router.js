import { Router } from "express";

const postRouter = Router();

postRouter.post("/post", createPost);
postRouter.get("/post/:id", getPostById);
postRouter.patch("/post/:id", updatePost);
postRouter.delete("/post/:id", deletePost);

export default postRouter;