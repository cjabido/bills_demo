import { prisma } from '../config/database.js';
import type { FrequencyType } from '@prisma/client';
import { generateOccurrence } from './bills.service.js';

export async function listInvestments() {
  return prisma.recurringTemplate.findMany({
    where: { templateType: 'investment' },
    orderBy: { nextDueDate: 'asc' },
    include: { category: true, account: true },
  });
}

export async function createInvestment(data: {
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
    data: {
      ...data,
      nextDueDate: new Date(data.nextDueDate),
      templateType: 'investment',
    },
    include: { category: true, account: true },
  });
}

export async function updateInvestment(id: string, data: {
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

export async function deleteInvestment(id: string) {
  return prisma.recurringTemplate.delete({ where: { id } });
}

export async function markContributed(id: string, amount?: number) {
  return generateOccurrence(id, amount);
}

export async function listContributionHistory(from: string, to: string) {
  return prisma.transaction.findMany({
    where: {
      recurringTemplateId: { not: null },
      recurringTemplate: { templateType: 'investment' },
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
    },
    orderBy: { date: 'desc' },
    include: { account: true, category: true, recurringTemplate: true },
  });
}
