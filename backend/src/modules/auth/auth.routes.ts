import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import {
  loginController,
  meController,
  registerController,
  updateProfileController,
} from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.get('/me', ensureAuthenticated, meController);
authRoutes.patch('/profile', ensureAuthenticated, updateProfileController);
