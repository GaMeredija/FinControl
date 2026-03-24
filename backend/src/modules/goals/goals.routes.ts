import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import {
  createGoalController,
  deleteGoalController,
  listGoalsController,
  updateGoalController,
} from './goals.controller';

export const goalsRoutes = Router();

goalsRoutes.use(ensureAuthenticated);

goalsRoutes.get('/', listGoalsController);
goalsRoutes.post('/', createGoalController);
goalsRoutes.put('/:id', updateGoalController);
goalsRoutes.delete('/:id', deleteGoalController);
