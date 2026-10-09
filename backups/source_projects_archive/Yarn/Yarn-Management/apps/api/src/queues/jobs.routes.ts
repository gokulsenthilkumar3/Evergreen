import { Router } from 'express';
import { queues } from './index';

// Simple auth middleware (replace with actual implementation)
const requireAuth = (req: any, res: any, next: any) => next();

const router = Router();

/**
 * Get queue statistics
 */
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const stats = await Promise.all(
            Object.entries(queues).map(async ([name, queue]) => {
                const [waiting, active, completed, failed, delayed] = await Promise.all([
                    queue.getWaitingCount(),
                    queue.getActiveCount(),
                    queue.getCompletedCount(),
                    queue.getFailedCount(),
                    queue.getDelayedCount(),
                ]);

                return {
                    name,
                    waiting,
                    active,
                    completed,
                    failed,
                    delayed,
                    total: waiting + active + completed + failed + delayed,
                };
            })
        );

        res.json({ stats });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get jobs from a specific queue
 */
router.get('/:queueName/jobs', requireAuth, async (req, res) => {
    try {
        const { queueName } = req.params;
        const { status = 'waiting', limit = 50 } = req.query;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        let jobs;
        switch (status) {
            case 'waiting':
                jobs = await queue.getWaiting(0, Number(limit) - 1);
                break;
            case 'active':
                jobs = await queue.getActive(0, Number(limit) - 1);
                break;
            case 'completed':
                jobs = await queue.getCompleted(0, Number(limit) - 1);
                break;
            case 'failed':
                jobs = await queue.getFailed(0, Number(limit) - 1);
                break;
            case 'delayed':
                jobs = await queue.getDelayed(0, Number(limit) - 1);
                break;
            default:
                jobs = await queue.getJobs([status as any], 0, Number(limit) - 1);
        }

        const jobData = jobs.map(job => ({
            id: job.id,
            data: job.data,
            progress: job.progress(),
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
            timestamp: job.timestamp,
        }));

        res.json({ jobs: jobData, count: jobData.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get specific job details
 */
router.get('/:queueName/jobs/:jobId', requireAuth, async (req, res) => {
    try {
        const { queueName, jobId } = req.params;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const state = await job.getState();

        res.json({
            id: job.id,
            name: job.name,
            data: job.data,
            opts: job.opts,
            progress: job.progress(),
            timestamp: job.timestamp,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            returnvalue: job.returnvalue,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
            state,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Retry a failed job
 */
router.post('/:queueName/jobs/:jobId/retry', requireAuth, async (req, res) => {
    try {
        const { queueName, jobId } = req.params;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        await job.retry();
        res.json({ message: 'Job retried successfully', jobId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Remove a job
 */
router.delete('/:queueName/jobs/:jobId', requireAuth, async (req, res) => {
    try {
        const { queueName, jobId } = req.params;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        const job = await queue.getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        await job.remove();
        res.json({ message: 'Job removed successfully', jobId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Clean queue (remove completed/failed jobs)
 */
router.post('/:queueName/clean', requireAuth, async (req, res) => {
    try {
        const { queueName } = req.params;
        const { grace = 3600000, status = 'completed' } = req.body; // Default: 1 hour

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        const removed = await queue.clean(Number(grace), status);
        res.json({ message: `Cleaned ${removed.length} jobs`, count: removed.length });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Pause a queue
 */
router.post('/:queueName/pause', requireAuth, async (req, res) => {
    try {
        const { queueName } = req.params;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        await queue.pause();
        res.json({ message: 'Queue paused successfully', queueName });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Resume a queue
 */
router.post('/:queueName/resume', requireAuth, async (req, res) => {
    try {
        const { queueName } = req.params;

        const queue = queues[queueName as keyof typeof queues];
        if (!queue) {
            return res.status(404).json({ error: 'Queue not found' });
        }

        await queue.resume();
        res.json({ message: 'Queue resumed successfully', queueName });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export const jobsRouter = router;
