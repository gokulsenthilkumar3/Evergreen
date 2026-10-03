import dotenv from 'dotenv';
import { z } from 'zod';

import path from 'path';

// Load from current directory or parent directory to handle workspace/root execution
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') }); // try one more up if nested deep
// Fallback for direct workspace execution
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN_DAYS: z.coerce.number().default(30),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  ADMIN_EMAIL: z.string().email().default('gokulkangeyan@gmail.com'),
  ADMIN_PASSWORD: z.string().min(12).default('admin123456!'),
  ENCRYPTION_SECRET: z.string().length(32).default('a-very-secret-key-32-chars-long!'),

  // Redis configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // Log retention configuration
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),
});

export const env = envSchema.parse(process.env);
