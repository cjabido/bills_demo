import { prisma } from '../config/database.js';
import type { CategoryType } from '@prisma/client';

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function createCategory(data: {
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  sortOrder?: number;
}) {
  return prisma.category.create({
    data: { ...data, isDefault: false },
  });
}

export async function updateCategory(id: string, data: {
  name?: string;
  color?: string;
  icon?: string;
  sortOrder?: number;
}) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  if (category.isDefault) {
    throw Object.assign(new Error('Cannot delete default categories'), { statusCode: 400, code: 'DEFAULT_CATEGORY' });
  }
  return prisma.category.delete({ where: { id } });
}
