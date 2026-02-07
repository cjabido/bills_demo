import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as billsService from '../services/bills.service.js';

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
    const bills = await billsService.listBills();
    res.json({ data: bills });
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const bill = await billsService.createBill(req.body);
    res.status(201).json({ data: bill });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const bill = await billsService.updateBill(req.params.id as string, req.body);
    res.json({ data: bill });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await billsService.deleteBill(req.params.id as string);
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
    const payments = await billsService.listBillPayments(from, to);
    res.json({ data: payments });
  } catch (err) { next(err); }
});

router.post('/:id/generate', async (req, res, next) => {
  try {
    const tx = await billsService.generateOccurrence(req.params.id as string);
    res.status(201).json({ data: tx });
  } catch (err) { next(err); }
});

const markPaidSchema = z.object({
  amount: z.number().positive().optional(),
});

router.post('/:id/mark-paid', validate(markPaidSchema), async (req, res, next) => {
  try {
    const tx = await billsService.markPaid(req.params.id as string, req.body.amount);
    res.status(201).json({ data: tx });
  } catch (err) { next(err); }
});

export default router;
