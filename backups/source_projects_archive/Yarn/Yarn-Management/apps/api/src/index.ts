import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);

  // Schedule idle session cleanup (every 1 minute)
  const { cleanupIdleSessions } = require('./modules/auth/auth.service');
  setInterval(cleanupIdleSessions, 60 * 1000);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Error: Port ${env.PORT} is already in use.`);
    console.error(`Please kill the process using port ${env.PORT} and try again.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});
