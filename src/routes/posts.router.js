import { Router } from "express";
import { createPost } from "../controllers/posts.controller.js";

const postRouter = Router();

postRouter.post("/post", createPost);
postRouter.get("/post/:id");
postRouter.patch("/post/:id");
postRouter.delete("/post/:id");

export default postRouter;