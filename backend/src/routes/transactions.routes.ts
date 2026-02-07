import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as txService from '../services/transactions.service.js';

const router = Router();

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  sort: z.enum(['date', 'amount', 'merchant']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

const createSchema = z.object({
  description: z.string().min(1),
  merchant: z.string().min(1),
  amount: z.number(),
  date: z.string(),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  recurringTemplateId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

const recategorizeSchema = z.object({
  categoryId: z.string().uuid(),
});

router.get('/', validate(querySchema, 'query'), async (req, res, next) => {
  try {
    const result = await txService.listTransactions(req.query as any);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const tx = await txService.createTransaction(req.body);
    res.status(201).json({ data: tx });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const tx = await txService.updateTransaction(req.params.id as string, req.body);
    res.json({ data: tx });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await txService.deleteTransaction(req.params.id as string);
    res.status(204).end();
  } catch (err) { next(err); }
});

router.patch('/:id/category', validate(recategorizeSchema), async (req, res, next) => {
  try {
    const tx = await txService.recategorize(req.params.id as string, req.body.categoryId);
    res.json({ data: tx });
  } catch (err) { next(err); }
});

export default router;
