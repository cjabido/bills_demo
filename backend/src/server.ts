import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import accountsRoutes from './routes/accounts.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import transactionsRoutes from './routes/transactions.routes.js';
import billsRoutes from './routes/bills.routes.js';
import incomeRoutes from './routes/income.routes.js';
import investmentsRoutes from './routes/investments.routes.js';
import periodsRoutes from './routes/periods.routes.js';
import assetsRoutes from './routes/assets.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import demoRoutes from './routes/demo.routes.js';

const app = express();

app.use(cors({
  origin: env.ALLOWED_ORIGIN === '*' ? '*' : env.ALLOWED_ORIGIN.split(',').map((o) => o.trim()),
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes (no authentication — this is the public demo)
app.use('/api/accounts', accountsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/periods', periodsRoutes);
app.use('/api/assets', assetsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/demo', demoRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

export default app;
