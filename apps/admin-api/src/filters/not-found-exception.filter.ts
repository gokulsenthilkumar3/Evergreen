import {
  ExceptionFilter,
  Catch,
  NotFoundException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.NOT_FOUND;
    const acceptsHtml = request.headers.accept?.includes('text/html');
    const wantsJson = request.query?.format === 'json';

    // Security: strip query string to never leak sensitive tokens, credentials, or keys
    const rawUrl = String(request.originalUrl || request.url || '/');
    const pathOnly = rawUrl.split('?')[0];
    const safePath = pathOnly.length > 64 ? pathOnly.slice(0, 64) + '…' : pathOnly;
    const safeMethod = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(request.method)
      ? request.method
      : 'UNKNOWN';

    // Ensure no-cache on 404 responses as well
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');

    // If client is a web browser (accepts HTML) and did not ask for json:
    if (acceptsHtml && !wantsJson) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — Endpoint Not Found | EverGreen One</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090e17;
      background-image: 
        radial-gradient(at 50% 20%, rgba(244, 63, 94, 0.08) 0px, transparent 60%),
        radial-gradient(at 80% 80%, rgba(16, 185, 129, 0.05) 0px, transparent 60%);
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: rgba(18, 26, 43, 0.85);
      border: 1px solid rgba(244, 63, 94, 0.35);
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      backdrop-filter: blur(16px);
    }
    .badge-404 {
      display: inline-block;
      background: rgba(244, 63, 94, 0.15);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
    }
    h1 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .url-chip {
      background: rgba(0,0,0,0.4);
      padding: 8px 14px;
      border-radius: 8px;
      color: #cbd5e1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.88rem;
      display: inline-block;
      margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.08);
      word-break: break-all;
    }
    .actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
      font-family: inherit;
    }
    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
    }
    .btn-ghost {
      background: rgba(255,255,255,0.06);
      color: #f8fafc;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .btn-ghost:hover {
      background: rgba(255,255,255,0.1);
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge-404">HTTP 404 NOT FOUND</div>
    <h1>Endpoint Not Found</h1>
    <div class="url-chip">${safeMethod} ${escapeHtml(safePath)}</div>
    <p>The requested endpoint does not exist on this server. No internal system details or credentials were exposed.</p>
    <div class="actions">
      <a href="/health" class="btn btn-primary">🌱 API Health Hub</a>
      <a href="/api/docs" class="btn btn-ghost">📑 API Documentation</a>
      <a href="http://localhost:4000" class="btn btn-ghost">🌐 Web App UI</a>
      <a href="http://localhost:5555" class="btn btn-ghost">🗄️ Database Studio</a>
    </div>
  </div>
</body>
</html>`;
      return response.status(status).type('html').send(html);
    }

    // Default clean, safe JSON response without echoing raw query strings or internal paths
    return response.status(status).json({
      statusCode: 404,
      error: 'Not Found',
      message: 'The requested resource was not found on this server.',
    });
  }
}
