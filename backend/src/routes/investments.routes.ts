import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as investmentsService from '../services/investments.service.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  frequency: z.enum(['monthly', 'semi_monthly', 'weekly', 'biweekly', 'quarterly', 'annual']),
  nextDueDate: z.string(),
  categoryId: z.string().uuid(),
  accountId: z.string().uuid(),
  isAutopay: z.boolean().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  isActive: z.boolean().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const investments = await investmentsService.listInvestments();
    res.json({ data: investments });
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const investment = await investmentsService.createInvestment(req.body);
    res.status(201).json({ data: investment });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const investment = await investmentsService.updateInvestment(req.params.id as string, req.body);
    res.json({ data: investment });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await investmentsService.deleteInvestment(req.params.id as string);
    res.status(204).end();
  } catch (err) { next(err); }
});

const markContributedSchema = z.object({
  amount: z.number().positive().optional(),
});

router.post('/:id/mark-contributed', validate(markContributedSchema), async (req, res, next) => {
  try {
    const tx = await investmentsService.markContributed(req.params.id as string, req.body.amount);
    res.status(201).json({ data: tx });
  } catch (err) { next(err); }
});

const contributionsQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

router.get('/contributions', validate(contributionsQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { from, to } = req.query as { from: string; to: string };
    const contributions = await investmentsService.listContributionHistory(from, to);
    res.json({ data: contributions });
  } catch (err) { next(err); }
});

export default router;
