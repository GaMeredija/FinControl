import { AppError } from '../../errors/app-error';
import {
  createCategory,
  deleteStoredCategory,
  findCategoryById,
  findCategoryByNameAndKind,
  listCategoriesByUser,
  updateStoredCategory,
} from '../../repositories/category.repository';
import { listTransactionsByUser } from '../../repositories/transaction.repository';
import { CreateCategoryInput, UpdateCategoryInput } from './categories.schemas';

function sanitizeCategory(category: {
  id: string;
  userId: string;
  name: string;
  kind: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    kind: category.kind,
    color: category.color,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function ensureCategoryOwnership(userId: string, categoryUserId: string) {
  if (userId !== categoryUserId) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }
}

async function ensureUniqueCategory(userId: string, name: string, kind: string, ignoreId?: string) {
  const existingCategory = await findCategoryByNameAndKind(userId, name, kind);

  if (existingCategory && existingCategory.id !== ignoreId) {
    throw new AppError(
      409,
      'Ja existe uma categoria com esse nome para este tipo.',
      'CATEGORY_ALREADY_EXISTS',
    );
  }
}

export async function listCategories(userId: string) {
  const categories = await listCategoriesByUser(userId);

  return categories
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(sanitizeCategory);
}

export async function createNewCategory(userId: string, data: CreateCategoryInput) {
  await ensureUniqueCategory(userId, data.name, data.kind);

  const category = await createCategory({
    userId,
    name: data.name,
    kind: data.kind,
    color: data.color,
  });

  return sanitizeCategory(category);
}

export async function updateCategory(userId: string, categoryId: string, data: UpdateCategoryInput) {
  const existingCategory = await findCategoryById(categoryId);

  if (!existingCategory) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }

  ensureCategoryOwnership(userId, existingCategory.userId);
  await ensureUniqueCategory(userId, data.name, data.kind, categoryId);

  const updatedCategory = await updateStoredCategory(categoryId, (category) => ({
    ...category,
    name: data.name,
    kind: data.kind,
    color: data.color,
    updatedAt: new Date().toISOString(),
  }));

  if (!updatedCategory) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }

  return sanitizeCategory(updatedCategory);
}

export async function deleteCategory(userId: string, categoryId: string) {
  const existingCategory = await findCategoryById(categoryId);

  if (!existingCategory) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }

  ensureCategoryOwnership(userId, existingCategory.userId);

  const transactions = await listTransactionsByUser(userId);
  const hasLinkedTransactions = transactions.some(
    (transaction) => transaction.categoryId === categoryId,
  );

  if (hasLinkedTransactions) {
    throw new AppError(
      409,
      'Nao e possivel remover categoria vinculada a lancamentos.',
      'CATEGORY_IN_USE',
    );
  }

  const removed = await deleteStoredCategory(categoryId);

  if (!removed) {
    throw new AppError(404, 'Categoria nao encontrada.', 'CATEGORY_NOT_FOUND');
  }

  return sanitizeCategory(existingCategory);
}
