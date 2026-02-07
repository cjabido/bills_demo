import { prisma } from '../config/database.js';
import type { Prisma } from '@prisma/client';

interface ListParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  accountId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export async function listTransactions(params: ListParams) {
  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 100);
  const skip = (page - 1) * pageSize;

  const where: Prisma.TransactionWhereInput = {};
  if (params.from || params.to) {
    where.date = {};
    if (params.from) where.date.gte = new Date(params.from);
    if (params.to) where.date.lte = new Date(params.to);
  }
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.accountId) where.accountId = params.accountId;

  const orderBy: Prisma.TransactionOrderByWithRelationInput = {
    [params.sort ?? 'date']: params.order ?? 'desc',
  };

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: { account: true, category: true },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { data, meta: { total, page, pageSize } };
}

export async function createTransaction(data: {
  description: string;
  merchant: string;
  amount: number;
  date: string;
  accountId: string;
  categoryId: string;
  recurringTemplateId?: string;
  notes?: string;
}) {
  return prisma.transaction.create({
    data: { ...data, date: new Date(data.date) },
    include: { account: true, category: true },
  });
}

export async function updateTransaction(id: string, data: {
  description?: string;
  merchant?: string;
  amount?: number;
  date?: string;
  accountId?: string;
  categoryId?: string;
  notes?: string;
}) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.date) updateData.date = new Date(data.date);
  return prisma.transaction.update({
    where: { id },
    data: updateData,
    include: { account: true, category: true },
  });
}

export async function deleteTransaction(id: string) {
  return prisma.transaction.delete({ where: { id } });
}

export async function recategorize(id: string, categoryId: string) {
  return prisma.transaction.update({
    where: { id },
    data: { categoryId },
    include: { account: true, category: true },
  });
}
