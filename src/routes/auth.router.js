import express, { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { registerValidation, loginValidation } from "../middlewares/validators.js";


const authRouter = express.Router();

authRouter.post('/register', registerValidation, register);
authRouter.post('/login', loginValidation, login);

export default authRouter;