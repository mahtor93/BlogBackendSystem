import { Router } from 'express';
import authRouter from './auth.router.js';
import meRouter from './me.router.js';
import usersRouter from './tenant.users.router.js';
import postRouter from './posts.router.js';
import tenantRouter from './tenant.router.js';

const router = Router();

router.use('/tenants', tenantRouter)
router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/users', usersRouter);
router.use('/post', postRouter);


export default router;