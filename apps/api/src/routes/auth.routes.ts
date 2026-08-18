import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticate as any, AuthController.me as any);
router.put('/profile', authenticate as any, AuthController.updateProfile as any);
router.put('/password', authenticate as any, AuthController.updatePassword as any);

export default router;
