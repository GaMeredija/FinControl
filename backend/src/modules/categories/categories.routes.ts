import { Router } from 'express';

import { ensureAuthenticated } from '../../middlewares/auth.middleware';
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryController,
} from './categories.controller';

export const categoriesRoutes = Router();

categoriesRoutes.use(ensureAuthenticated);

categoriesRoutes.get('/', listCategoriesController);
categoriesRoutes.post('/', createCategoryController);
categoriesRoutes.put('/:id', updateCategoryController);
categoriesRoutes.delete('/:id', deleteCategoryController);
