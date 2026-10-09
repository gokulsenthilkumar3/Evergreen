import Queue from 'bull';
import { env } from '../config/env';

// Redis connection configuration
const redisConfig = {
    host: env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT || '6379'),
    password: env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
};

/**
 * Email Queue
 * Handles async email sending
 */
export const emailQueue = new Queue('email', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

/**
 * Report Generation Queue
 * Handles async report generation
 */
export const reportQueue = new Queue('report', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 5000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: false,
    },
});

/**
 * Notification Queue
 * Handles async notification sending
 */
export const notificationQueue = new Queue('notification', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

/**
 * Data Processing Queue
 * Handles heavy data processing tasks
 */
export const dataProcessingQueue = new Queue('data-processing', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 1,
        timeout: 300000, // 5 minutes
        removeOnComplete: 50,
        removeOnFail: false,
    },
});

/**
 * Scheduled Tasks Queue
 * Handles cron-like scheduled tasks
 */
export const scheduledTasksQueue = new Queue('scheduled-tasks', {
    redis: redisConfig,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 60000, // 1 minute
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

// Export all queues
export const queues = {
    email: emailQueue,
    report: reportQueue,
    notification: notificationQueue,
    dataProcessing: dataProcessingQueue,
    scheduledTasks: scheduledTasksQueue,
};

// Graceful shutdown
export const closeQueues = async () => {
    await Promise.all([
        emailQueue.close(),
        reportQueue.close(),
        notificationQueue.close(),
        dataProcessingQueue.close(),
        scheduledTasksQueue.close(),
    ]);
};
