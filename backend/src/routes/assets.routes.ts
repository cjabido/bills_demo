import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as assetsService from '../services/assets.service.js';

const router = Router();

const snapshotSchema = z.object({
  accountId: z.string().uuid(),
  date: z.string(),
  balance: z.number(),
  costBasis: z.number().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const accounts = await assetsService.listAssetAccounts();
    res.json({ data: accounts });
  } catch (err) { next(err); }
});

router.post('/snapshots', validate(snapshotSchema), async (req, res, next) => {
  try {
    const snapshot = await assetsService.createSnapshot(req.body);
    res.status(201).json({ data: snapshot });
  } catch (err) { next(err); }
});

router.get('/history', async (req, res, next) => {
  try {
    const accountId = req.query.accountId as string | undefined;
    const months = Number(req.query.months) || 12;
    const snapshots = await assetsService.getHistory(accountId, months);
    res.json({ data: snapshots });
  } catch (err) { next(err); }
});

router.get('/net-worth', async (_req, res, next) => {
  try {
    const netWorth = await assetsService.getNetWorth();
    res.json({ data: netWorth });
  } catch (err) { next(err); }
});

export default router;
