import * as userController from '@/controllers/userController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { Router } from 'express';

const route = Router();
export { route as userRoute };

route.post('/', userController.createUser);
route.get('/', authMiddleware, userController.getUser);
route.get('/handshake/:id', userController.handshake);
route.get('/pusher-token', authMiddleware, userController.getPusherToken);
