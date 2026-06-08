import cron from 'node-cron';
import { generateOrders } from './generateOrders.js';
import { advanceOrderStatus } from './advanceStatus.js';
import { buildDailySnapshot } from './dailySnapshot.js';

const jobs = [
  {
    name: 'generateOrders',
    schedule: '0 * * * *', // 每小時整點
    fn: generateOrders,
  },
  {
    name: 'advanceOrderStatus',
    schedule: '30 * * * *', // 每小時 30 分
    fn: advanceOrderStatus,
  },
  {
    name: 'dailySnapshot',
    schedule: '5 0 * * *', // 每天 00:05
    fn: buildDailySnapshot,
  },
];

export function startJobs() {
  for (const job of jobs) {
    cron.schedule(job.schedule, async () => {
      try {
        await job.fn();
      } catch (err) {
        console.error(`[${job.name}] Error:`, err.message);
      }
    });
    console.log(`[jobs] Registered: ${job.name} (${job.schedule})`);
  }
}

export { jobs };
