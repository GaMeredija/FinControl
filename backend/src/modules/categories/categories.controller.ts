import { Response } from 'express';

import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import {
  createCategorySchema,
  updateCategorySchema,
} from './categories.schemas';
import {
  createNewCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from './categories.service';

export async function listCategoriesController(req: AuthenticatedRequest, res: Response) {
  const categories = await listCategories(req.userId as string);

  return res.status(200).json({
    data: categories,
    message: 'Categorias carregadas com sucesso.',
  });
}

export async function createCategoryController(req: AuthenticatedRequest, res: Response) {
  const data = createCategorySchema.parse(req.body);
  const category = await createNewCategory(req.userId as string, data);

  return res.status(201).json({
    data: category,
    message: 'Categoria criada com sucesso.',
  });
}

export async function updateCategoryController(req: AuthenticatedRequest, res: Response) {
  const data = updateCategorySchema.parse(req.body);
  const category = await updateCategory(req.userId as string, String(req.params.id), data);

  return res.status(200).json({
    data: category,
    message: 'Categoria atualizada com sucesso.',
  });
}

export async function deleteCategoryController(req: AuthenticatedRequest, res: Response) {
  const category = await deleteCategory(req.userId as string, String(req.params.id));

  return res.status(200).json({
    data: category,
    message: 'Categoria removida com sucesso.',
  });
}
