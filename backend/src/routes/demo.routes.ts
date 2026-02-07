import { Router } from 'express';
import { seed } from '../lib/seed.js';

const router = Router();

let lastResetAt = 0;
const COOLDOWN_MS = 60_000; // 60 seconds

router.post('/reset', async (_req, res, next) => {
  try {
    const now = Date.now();
    if (now - lastResetAt < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - lastResetAt)) / 1000);
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: `Please wait ${remaining}s before resetting again.` },
      });
      return;
    }

    lastResetAt = now;
    await seed();
    res.json({ data: { message: 'Demo data has been reset to defaults.' } });
  } catch (err) {
    next(err);
  }
});

export default router;
