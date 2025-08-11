import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.get('/check', controller.checkAuth);

export class AuthRoutes {
  static get routes() {
    return router;
  }
} 