import * as userController from '@/controllers/userController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { Router } from 'express';

const route = Router();
export { route as userRoute };

route.post('/', userController.createUser);
route.get('/', authMiddleware, userController.getUser);
