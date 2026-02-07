import { prisma } from '../config/database.js';
import type { FrequencyType } from '@prisma/client';
import { computeNextDueDate } from '../utils/dates.js';

export async function listIncomeSources() {
  return prisma.recurringTemplate.findMany({
    where: { templateType: 'income' },
    orderBy: { nextDueDate: 'asc' },
    include: { category: true, account: true },
  });
}

export async function createIncomeSource(data: {
  name: string;
  amount: number;
  frequency: FrequencyType;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  notes?: string;
}) {
  return prisma.recurringTemplate.create({
    data: { ...data, nextDueDate: new Date(data.nextDueDate), templateType: 'income' },
    include: { category: true, account: true },
  });
}

export async function updateIncomeSource(id: string, data: {
  name?: string;
  amount?: number;
  frequency?: FrequencyType;
  nextDueDate?: string;
  categoryId?: string;
  accountId?: string;
  isActive?: boolean;
  notes?: string;
}) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.nextDueDate) updateData.nextDueDate = new Date(data.nextDueDate);
  return prisma.recurringTemplate.update({
    where: { id },
    data: updateData,
    include: { category: true, account: true },
  });
}

export async function deleteIncomeSource(id: string) {
  return prisma.recurringTemplate.delete({ where: { id } });
}

export async function markReceived(id: string, amountOverride?: number) {
  const source = await prisma.recurringTemplate.findUniqueOrThrow({
    where: { id },
    include: { category: true },
  });

  const amount = Math.abs(Number(amountOverride ?? source.amount));

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        description: source.name,
        merchant: source.name,
        amount,
        date: source.nextDueDate,
        accountId: source.accountId,
        categoryId: source.categoryId,
        recurringTemplateId: source.id,
      },
      include: { account: true, category: true },
    }),
    prisma.recurringTemplate.update({
      where: { id },
      data: { nextDueDate: computeNextDueDate(source.nextDueDate, source.frequency) },
    }),
  ]);

  return transaction;
}

export async function listIncomePayments(from: string, to: string) {
  return prisma.transaction.findMany({
    where: {
      recurringTemplateId: { not: null },
      recurringTemplate: { templateType: 'income' },
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { date: 'desc' },
    include: { account: true, category: true, recurringTemplate: true },
  });
}
