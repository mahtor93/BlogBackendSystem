import { Router } from 'express';
import authRouter from './auth.router.js';
import meRouter from './me.router.js';
import usersRouter from './users.router.js';
import postRouter from './posts.router.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/users', usersRouter);
router.use('/posts', postRouter);


export default router;