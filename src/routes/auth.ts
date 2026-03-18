import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', (req, res) => {
  AuthController.register(req, res);
});

router.post('/login', (req, res) => {
  AuthController.login(req, res);
});

router.get('/me', authenticate, (req, res) => {
  AuthController.getMe(req, res);
});

export default router;
