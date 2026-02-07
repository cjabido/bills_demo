import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as incomeService from '../services/income.service.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  frequency: z.enum(['monthly', 'semi_monthly', 'weekly', 'biweekly', 'quarterly', 'annual']),
  nextDueDate: z.string(),
  categoryId: z.string().uuid(),
  accountId: z.string().uuid(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const sources = await incomeService.listIncomeSources();
    res.json({ data: sources });
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const source = await incomeService.createIncomeSource(req.body);
    res.status(201).json({ data: source });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const source = await incomeService.updateIncomeSource(req.params.id as string, req.body);
    res.json({ data: source });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await incomeService.deleteIncomeSource(req.params.id as string);
    res.status(204).end();
  } catch (err) { next(err); }
});

const paymentsQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

router.get('/payments', validate(paymentsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const payments = await incomeService.listIncomePayments(from, to);
    res.json({ data: payments });
  } catch (err) { next(err); }
});

const markReceivedSchema = z.object({
  amount: z.number().positive().optional(),
});

router.post('/:id/mark-received', validate(markReceivedSchema), async (req, res, next) => {
  try {
    const tx = await incomeService.markReceived(req.params.id as string, req.body.amount);
    res.status(201).json({ data: tx });
  } catch (err) { next(err); }
});

export default router;
