import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as periodsService from '../services/periods.service.js';

const router = Router();

const budgetSchema = z.object({
  categoryId: z.string().uuid(),
  budgetedAmount: z.number(),
});

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

router.get('/', validate(querySchema, 'query'), async (req, res, next) => {
  try {
    const result = await periodsService.listPeriods(
      Number(req.query.page) || 1,
      Number(req.query.pageSize) || 12,
    );
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/current', async (_req, res, next) => {
  try {
    const period = await periodsService.getCurrentPeriod();
    res.json({ data: period });
  } catch (err) { next(err); }
});

router.get('/:year/:month/:half', async (req, res, next) => {
  try {
    const period = await periodsService.getPeriodWithActuals(
      Number(req.params.year),
      Number(req.params.month),
      Number(req.params.half),
    );
    res.json({ data: period });
  } catch (err) { next(err); }
});

const updatePeriodSchema = z.object({
  startingBalance: z.number().optional(),
  projectedIncome: z.number().optional(),
  projectedExpenses: z.number().optional(),
  notes: z.string().optional(),
});

router.put('/:id', validate(updatePeriodSchema), async (req, res, next) => {
  try {
    const period = await periodsService.updatePeriod(req.params.id as string, req.body);
    res.json({ data: period });
  } catch (err) { next(err); }
});

router.put('/:id/budget', validate(budgetSchema), async (req, res, next) => {
  try {
    const budget = await periodsService.setBudget(
      req.params.id as string,
      req.body.categoryId,
      req.body.budgetedAmount,
    );
    res.json({ data: budget });
  } catch (err) { next(err); }
});

export default router;
