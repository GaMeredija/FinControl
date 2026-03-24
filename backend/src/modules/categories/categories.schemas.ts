import { z } from 'zod';

const categoryName = z
  .string()
  .trim()
  .min(2, 'Informe um nome valido para a categoria.')
  .max(48, 'O nome da categoria deve ter no maximo 48 caracteres.');

const categoryKind = z.enum(['income', 'expense']);

const categoryColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Informe uma cor hexadecimal valida.');

export const createCategorySchema = z.object({
  name: categoryName,
  kind: categoryKind,
  color: categoryColor,
});

export const updateCategorySchema = z.object({
  name: categoryName,
  kind: categoryKind,
  color: categoryColor,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
