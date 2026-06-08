import cron from 'node-cron';
import { JobLog } from '../models/index.js';
import { generateOrders } from './generateOrders.js';
import { advanceOrderStatus } from './advanceStatus.js';
import { buildDailySnapshot } from './dailySnapshot.js';

const jobs = [
  {
    name: 'generateOrders',
    schedule: '0 * * * *',
    fn: generateOrders,
  },
  {
    name: 'advanceOrderStatus',
    schedule: '30 * * * *',
    fn: advanceOrderStatus,
  },
  {
    name: 'dailySnapshot',
    schedule: '5 0 * * *',
    fn: buildDailySnapshot,
  },
];

async function runJob(job) {
  const start = Date.now();
  try {
    const message = await job.fn();
    const duration = Date.now() - start;
    await JobLog.create({ jobName: job.name, status: 'success', message, duration });
    console.log(`[${job.name}] ${message} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    await JobLog.create({ jobName: job.name, status: 'error', message: err.message, duration });
    console.error(`[${job.name}] Error: ${err.message}`);
  }
}

export function startJobs() {
  for (const job of jobs) {
    cron.schedule(job.schedule, () => runJob(job));
    console.log(`[jobs] Registered: ${job.name} (${job.schedule})`);
  }
}

export { jobs, runJob };
