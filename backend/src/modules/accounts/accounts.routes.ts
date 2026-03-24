import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import {
  createAccountController,
  inactivateAccountController,
  listAccountsController,
  updateAccountController,
} from './accounts.controller';

export const accountsRoutes = Router();

accountsRoutes.use(ensureAuthenticated);

accountsRoutes.get('/', listAccountsController);
accountsRoutes.post('/', createAccountController);
accountsRoutes.put('/:id', updateAccountController);
accountsRoutes.patch('/:id/inactivate', inactivateAccountController);

