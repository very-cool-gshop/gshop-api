import { JobLog } from '../models/index.js';
import { jobs, runJob } from '../jobs/index.js';
import { Op } from 'sequelize';

// GET /admin/jobs
export const getJobs = async (req, res, next) => {
  try {
    const result = await Promise.all(jobs.map(async (job) => {
      const last = await JobLog.findOne({
        where: { jobName: job.name },
        order: [['createdAt', 'DESC']],
      });
      return {
        name: job.name,
        schedule: job.schedule,
        lastRun: last?.createdAt ?? null,
        lastStatus: last?.status ?? null,
        lastMessage: last?.message ?? null,
      };
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /admin/jobs/:name/run
export const triggerJob = async (req, res, next) => {
  try {
    const job = jobs.find(j => j.name === req.params.name);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    await runJob(job);
    const log = await JobLog.findOne({
      where: { jobName: job.name },
      order: [['createdAt', 'DESC']],
    });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

// GET /admin/jobs/logs?jobName=generateOrders&limit=50
export const getJobLogs = async (req, res, next) => {
  try {
    const { jobName, limit = 50 } = req.query;
    const where = jobName ? { jobName } : {};
    const logs = await JobLog.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(Number(limit), 200),
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};
