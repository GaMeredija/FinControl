import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import {
  createTransactionController,
  deleteTransactionController,
  listTransactionsController,
  updateTransactionController,
} from './transactions.controller';

export const transactionsRoutes = Router();

transactionsRoutes.use(ensureAuthenticated);

transactionsRoutes.get('/', listTransactionsController);
transactionsRoutes.post('/', createTransactionController);
transactionsRoutes.put('/:id', updateTransactionController);
transactionsRoutes.delete('/:id', deleteTransactionController);
