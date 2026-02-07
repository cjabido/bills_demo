import { seed } from '../src/lib/seed.js';

seed()
  .catch(console.error)
  .finally(() => process.exit());
