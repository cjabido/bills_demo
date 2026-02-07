import { prisma } from '../config/database.js';
import type { FrequencyType } from '@prisma/client';
import { computeNextDueDate } from '../utils/dates.js';

export async function listBills() {
  return prisma.recurringTemplate.findMany({
    where: { templateType: 'bill' },
    orderBy: { nextDueDate: 'asc' },
    include: { category: true, account: true },
  });
}

export async function createBill(data: {
  name: string;
  amount: number;
  frequency: FrequencyType;
  nextDueDate: string;
  categoryId: string;
  accountId: string;
  isAutopay?: boolean;
  notes?: string;
}) {
  return prisma.recurringTemplate.create({
    data: { ...data, nextDueDate: new Date(data.nextDueDate) },
    include: { category: true, account: true },
  });
}

export async function updateBill(id: string, data: {
  name?: string;
  amount?: number;
  frequency?: FrequencyType;
  nextDueDate?: string;
  categoryId?: string;
  accountId?: string;
  isAutopay?: boolean;
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

export async function deleteBill(id: string) {
  return prisma.recurringTemplate.delete({ where: { id } });
}

export async function generateOccurrence(id: string, amountOverride?: number) {
  const bill = await prisma.recurringTemplate.findUniqueOrThrow({
    where: { id },
    include: { category: true },
  });

  const raw = Number(amountOverride ?? bill.amount);
  const amount = bill.category.type === 'expense' ? -Math.abs(raw) : Math.abs(raw);

  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        description: bill.name,
        merchant: bill.name,
        amount,
        date: bill.nextDueDate,
        accountId: bill.accountId,
        categoryId: bill.categoryId,
        recurringTemplateId: bill.id,
      },
      include: { account: true, category: true },
    }),
    prisma.recurringTemplate.update({
      where: { id },
      data: { nextDueDate: computeNextDueDate(bill.nextDueDate, bill.frequency) },
    }),
  ]);

  return transaction;
}

export async function markPaid(id: string, amount?: number) {
  return generateOccurrence(id, amount);
}

export async function listBillPayments(from: string, to: string) {
  return prisma.transaction.findMany({
    where: {
      recurringTemplateId: { not: null },
      recurringTemplate: { templateType: 'bill' },
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { date: 'desc' },
    include: { account: true, category: true, recurringTemplate: true },
  });
}
