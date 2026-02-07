import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as accountsService from '../services/accounts.service.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['checking', 'savings', 'credit_card', 'investment', 'loan']),
  institution: z.string().min(1),
  lastFour: z.string().length(4),
  balance: z.number().optional(),
});

const updateSchema = createSchema.partial();

router.get('/', async (_req, res, next) => {
  try {
    const accounts = await accountsService.listAccounts();
    res.json({ data: accounts });
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const account = await accountsService.createAccount(req.body);
    res.status(201).json({ data: account });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const account = await accountsService.updateAccount(req.params.id as string, req.body);
    res.json({ data: account });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await accountsService.deleteAccount(req.params.id as string);
    res.status(204).end();
  } catch (err) { next(err); }
});

router.patch('/:id/active', async (req, res, next) => {
  try {
    const account = await accountsService.toggleActive(req.params.id as string);
    res.json({ data: account });
  } catch (err) { next(err); }
});

export default router;
