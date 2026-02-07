import { addMonths, addWeeks, addYears } from 'date-fns';
import type { FrequencyType } from '@prisma/client';

export function computeNextDueDate(currentDueDate: Date, frequency: FrequencyType): Date {
  switch (frequency) {
    case 'monthly':      return addMonths(currentDueDate, 1);
    case 'semi_monthly': {
      const day = currentDueDate.getDate();
      if (day <= 15) {
        const next = new Date(currentDueDate);
        next.setDate(day + 15);
        if (next.getMonth() !== currentDueDate.getMonth()) {
          // Overflowed — set to last day of original month
          next.setDate(0);
        }
        return next;
      } else {
        const next = addMonths(currentDueDate, 1);
        next.setDate(day - 15);
        return next;
      }
    }
    case 'weekly':       return addWeeks(currentDueDate, 1);
    case 'biweekly':     return addWeeks(currentDueDate, 2);
    case 'quarterly':    return addMonths(currentDueDate, 3);
    case 'annual':       return addYears(currentDueDate, 1);
  }
}

export function getPeriodDateRange(year: number, month: number, half: number): { start: Date; end: Date } {
  if (half === 1) {
    return {
      start: new Date(year, month - 1, 1),
      end: new Date(year, month - 1, 15, 23, 59, 59, 999),
    };
  } else {
    const lastDay = new Date(year, month, 0).getDate();
    return {
      start: new Date(year, month - 1, 16),
      end: new Date(year, month - 1, lastDay, 23, 59, 59, 999),
    };
  }
}
