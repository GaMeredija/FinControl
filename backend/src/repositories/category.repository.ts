import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { env } from '../config/env';
import {
  getPrismaClient,
  isPrismaProvider,
  toDateTimeString,
} from '../lib/prisma';
import { readJsonFile, writeJsonFile } from './json-file.repository';

export type StoredCategory = {
  id: string;
  userId: string;
  name: string;
  kind: 'income' | 'expense';
  color: string;
  createdAt: string;
  updatedAt: string;
};

const categoriesFilePath = path.resolve(process.cwd(), env.CATEGORIES_FILE_PATH);

async function readCategories() {
  return readJsonFile<StoredCategory[]>(categoriesFilePath);
}

async function writeCategories(categories: StoredCategory[]) {
  await writeJsonFile(categoriesFilePath, categories);
}

function mapPrismaCategory(category: {
  id: string;
  userId: string;
  name: string;
  kind: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    kind: category.kind as StoredCategory['kind'],
    color: category.color ?? '#147a68',
    createdAt: toDateTimeString(category.createdAt),
    updatedAt: toDateTimeString(category.updatedAt),
  } satisfies StoredCategory;
}

export async function createCategory(
  data: Omit<StoredCategory, 'id' | 'createdAt' | 'updatedAt'>,
) {
  if (isPrismaProvider()) {
    const category = await getPrismaClient().category.create({
      data: {
        userId: data.userId,
        name: data.name,
        kind: data.kind,
        color: data.color,
      },
    });

    return mapPrismaCategory(category);
  }

  const categories = await readCategories();
  const now = new Date().toISOString();

  const category: StoredCategory = {
    id: randomUUID(),
    userId: data.userId,
    name: data.name,
    kind: data.kind,
    color: data.color,
    createdAt: now,
    updatedAt: now,
  };

  categories.push(category);
  await writeCategories(categories);

  return category;
}

export async function findCategoryById(categoryId: string) {
  if (isPrismaProvider()) {
    const category = await getPrismaClient().category.findUnique({
      where: { id: categoryId },
    });

    return category ? mapPrismaCategory(category) : null;
  }

  const categories = await readCategories();
  return categories.find((category) => category.id === categoryId) ?? null;
}

export async function listCategoriesByUser(userId: string) {
  if (isPrismaProvider()) {
    const categories = await getPrismaClient().category.findMany({
      where: { userId },
    });

    return categories.map(mapPrismaCategory);
  }

  const categories = await readCategories();
  return categories.filter((category) => category.userId === userId);
}

export async function findCategoryByNameAndKind(userId: string, name: string, kind: string) {
  if (isPrismaProvider()) {
    const category = await getPrismaClient().category.findFirst({
      where: {
        userId,
        kind,
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    return category ? mapPrismaCategory(category) : null;
  }

  const categories = await readCategories();
  return categories.find(
    (category) => category.userId === userId
      && category.kind === kind
      && category.name.trim().toLowerCase() === name.trim().toLowerCase(),
  ) ?? null;
}

export async function updateStoredCategory(
  categoryId: string,
  updater: (category: StoredCategory) => StoredCategory,
) {
  if (isPrismaProvider()) {
    const existingCategory = await findCategoryById(categoryId);

    if (!existingCategory) {
      return null;
    }

    const updatedCategory = updater(existingCategory);
    const category = await getPrismaClient().category.update({
      where: { id: categoryId },
      data: {
        name: updatedCategory.name,
        kind: updatedCategory.kind,
        color: updatedCategory.color,
      },
    });

    return mapPrismaCategory(category);
  }

  const categories = await readCategories();
  const categoryIndex = categories.findIndex((category) => category.id === categoryId);

  if (categoryIndex === -1) {
    return null;
  }

  const updatedCategory = updater(categories[categoryIndex]);
  categories[categoryIndex] = updatedCategory;

  await writeCategories(categories);

  return updatedCategory;
}

export async function deleteStoredCategory(categoryId: string) {
  if (isPrismaProvider()) {
    const deletedCategory = await getPrismaClient().category.deleteMany({
      where: { id: categoryId },
    });

    return deletedCategory.count > 0;
  }

  const categories = await readCategories();
  const categoryIndex = categories.findIndex((category) => category.id === categoryId);

  if (categoryIndex === -1) {
    return false;
  }

  categories.splice(categoryIndex, 1);
  await writeCategories(categories);

  return true;
}
