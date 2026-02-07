import { prisma } from '../config/database.js';
import type { AccountType } from '@prisma/client';

export async function listAccounts() {
  return prisma.account.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
  });
}

export async function createAccount(data: {
  name: string;
  type: AccountType;
  institution: string;
  lastFour: string;
  balance?: number;
  isTaxable?: boolean;
}) {
  return prisma.account.create({ data });
}

export async function updateAccount(id: string, data: {
  name?: string;
  type?: AccountType;
  institution?: string;
  lastFour?: string;
  balance?: number;
  isTaxable?: boolean;
}) {
  return prisma.account.update({ where: { id }, data });
}

export async function deleteAccount(id: string) {
  return prisma.account.delete({ where: { id } });
}

export async function toggleActive(id: string) {
  const account = await prisma.account.findUniqueOrThrow({ where: { id } });
  return prisma.account.update({
    where: { id },
    data: { isActive: !account.isActive },
  });
}
