import express, { Router } from "express";
import {  login } from "../controllers/auth.controller.js";
import { loginValidation } from "../middlewares/validators.js";
import resolveDomainContext from "../middlewares/resolveDomainContext.js";


const authRouter = express.Router();


authRouter.post('/login', loginValidation, resolveDomainContext, login);

export default authRouter;