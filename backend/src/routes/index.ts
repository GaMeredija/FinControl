import { Router } from 'express';

import { accountsRoutes } from '../modules/accounts/accounts.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { categoriesRoutes } from '../modules/categories/categories.routes';
import { goalsRoutes } from '../modules/goals/goals.routes';
import { reportsRoutes } from '../modules/reports/reports.routes';
import { transactionsRoutes } from '../modules/transactions/transactions.routes';

export const router = Router();

router.use('/auth', authRoutes);
router.use('/accounts', accountsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/goals', goalsRoutes);
router.use('/reports', reportsRoutes);
router.use('/transactions', transactionsRoutes);
