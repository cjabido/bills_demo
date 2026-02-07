import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import * as categoriesService from '../services/categories.service.js';

const router = Router();

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1),
  icon: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  icon: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

router.get('/', async (_req, res, next) => {
  try {
    const categories = await categoriesService.listCategories();
    res.json({ data: categories });
  } catch (err) { next(err); }
});

router.post('/', validate(createSchema), async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (err) { next(err); }
});

router.put('/:id', validate(updateSchema), async (req, res, next) => {
  try {
    const category = await categoriesService.updateCategory(req.params.id as string, req.body);
    res.json({ data: category });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await categoriesService.deleteCategory(req.params.id as string);
    res.status(204).end();
  } catch (err) { next(err); }
});

export default router;
