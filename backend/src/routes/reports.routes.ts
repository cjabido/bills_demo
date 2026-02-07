import { Router } from 'express';
import * as reportsService from '../services/reports.service.js';

const router = Router();

router.get('/monthly', async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 12;
    const data = await reportsService.getMonthlySummary(months);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/spending', async (req, res, next) => {
  try {
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const data = await reportsService.getCategorySpending(from, to);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/merchants', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const data = await reportsService.getTopMerchants(limit, from, to);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get('/net-worth', async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 12;
    const data = await reportsService.getNetWorthHistory(months);
    res.json({ data });
  } catch (err) { next(err); }
});

export default router;
