const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const rootDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });

const PORT = Number(process.env.DB_STUDIO_PORT || 5555);
const dbFilePath = path.join(rootDir, 'packages', 'database', 'prisma', 'dev.db');
const JWT_SECRET = process.env.JWT_SECRET || 'evergreen-default-dev-secret-key-32-chars-long';

const prisma = new PrismaClient();

// Safe BigInt serializer for JSON.stringify
function safeJson(data) {
  return JSON.stringify(data, (_key, value) => {
    if (typeof value === 'bigint') return Number(value);
    return value;
  });
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getValidTables() {
  const rawTables = await prisma.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name;"
  );
  return rawTables.map(t => t.name);
}

// Authentication middleware & session verifier
async function authenticateRequest(req) {
  const urlObj = new URL(req.url, 'http://' + req.headers.host);
  let token = null;

  // 1. Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // 2. Query parameter: ?token=...
  if (!token && urlObj.searchParams.has('token')) {
    token = urlObj.searchParams.get('token');
  }

  // 3. Cookie header: evergreen_token=...
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/evergreen_token=([^;]+)/);
    if (match) token = decodeURIComponent(match[1]);
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.sessionId || !payload.sub) return null;

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || !session.isValid || session.userId !== payload.sub) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, role: true, name: true, email: true },
    });

    if (!user) return null;

    // Refresh lastActive asynchronously
    prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    }).catch(() => {});

    return { user, session, token };
  } catch {
    return null;
  }
}

function render404Html(reqPath, message = 'The requested database resource was not found.') {
  const cleanPath = String(reqPath || '/').split('?')[0];
  const safePath = cleanPath.length > 64 ? cleanPath.slice(0, 64) + '…' : cleanPath;
  const safeMsg = escapeHtml(message);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — Database Resource Not Found | EverGreen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090e17;
      background-image: radial-gradient(at 50% 30%, rgba(244, 63, 94, 0.08) 0px, transparent 60%);
      color: #f8fafc;
      font-family: 'Outfit', sans-serif;
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
      border: 1px solid rgba(244, 63, 94, 0.3);
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
      background: rgba(0,0,0,0.3);
      padding: 6px 12px;
      border-radius: 6px;
      color: #cbd5e1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
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
    <h1>Database Route Not Found</h1>
    <div class="url-chip">${escapeHtml(safePath)}</div>
    <p>${safeMsg}</p>
    <div class="actions">
      <a href="/" class="btn btn-primary">🗄️ Database Explorer Home</a>
      <a href="http://localhost:4301/health" class="btn btn-ghost">🌱 API Health Hub</a>
      <a href="http://localhost:4000" class="btn btn-ghost">🌐 Web App</a>
    </div>
  </div>
</body>
</html>`;
}

function renderStudioHtml(initialTable = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EverGreen Database Studio & Explorer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070c17;
      --card-bg: rgba(15, 23, 42, 0.75);
      --card-border: rgba(30, 41, 59, 0.85);
      --text-main: #f8fafc;
      --text-sub: #94a3b8;
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.3);
      --emerald-sub: #059669;
      --teal: #14b8a6;
      --blue: #3b82f6;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --purple: #a855f7;
      --font: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 10% 10%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(59, 130, 246, 0.06) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(20, 184, 166, 0.03) 0px, transparent 60%);
      background-attachment: fixed;
      color: var(--text-main);
      font-family: var(--font);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }

    /* Header */
    header {
      background: rgba(8, 14, 26, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
      backdrop-filter: blur(14px);
      z-index: 50;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 16px var(--emerald-glow);
    }

    .brand-text h1 {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-text p {
      font-size: 0.72rem;
      color: var(--text-sub);
    }

    .badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 999px;
      text-transform: uppercase;
      font-family: var(--mono);
      letter-spacing: 0.04em;
    }

    .badge-emerald {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-blue {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .badge-amber {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-purple {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .badge-rose {
      background: rgba(244, 63, 94, 0.15);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }

    .status-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .header-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .btn-ghost {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
    }

    .btn-secondary {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .btn-secondary:hover {
      background: rgba(59, 130, 246, 0.25);
      transform: translateY(-1px);
    }

    .auth-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(18, 26, 43, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 5px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
    }

    /* Studio Main Layout */
    .studio-container {
      display: flex;
      flex: 1;
      height: calc(100vh - 61px);
      overflow: hidden;
    }

    /* Left Sidebar: Tables List */
    .sidebar {
      width: 290px;
      background: rgba(12, 18, 30, 0.9);
      border-right: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      backdrop-filter: blur(12px);
    }

    .sidebar-header {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 12px 8px 32px;
      color: white;
      font-family: inherit;
      font-size: 0.8rem;
      outline: none;
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: var(--emerald);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .search-icon {
      position: absolute;
      left: 10px;
      font-size: 0.8rem;
      color: var(--text-sub);
      pointer-events: none;
    }

    .category-pills {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      padding-bottom: 2px;
    }

    .cat-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      color: var(--text-sub);
      padding: 3px 8px;
      font-size: 0.7rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s;
    }

    .cat-btn.active, .cat-btn:hover {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }

    .table-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .table-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.82rem;
      color: var(--text-sub);
      cursor: pointer;
      transition: all 0.15s;
      margin-bottom: 2px;
      user-select: none;
    }

    .table-item:hover {
      background: rgba(255, 255, 255, 0.04);
      color: var(--text-main);
    }

    .table-item.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      font-weight: 700;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .table-item-name {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .count-badge {
      font-size: 0.7rem;
      background: rgba(0, 0, 0, 0.35);
      padding: 2px 7px;
      border-radius: 99px;
      font-family: var(--mono);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sidebar-footer {
      padding: 10px 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.72rem;
      color: var(--text-sub);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(0, 0, 0, 0.2);
    }

    /* Main View Area */
    .main-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(9, 14, 23, 0.4);
    }

    /* View Tabs Bar */
    .view-tabs-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid var(--card-border);
      flex-shrink: 0;
      gap: 16px;
      flex-wrap: wrap;
    }

    .tabs {
      display: flex;
      gap: 6px;
    }

    .tab-btn {
      padding: 6px 14px;
      border-radius: 7px;
      font-size: 0.82rem;
      font-weight: 600;
      background: transparent;
      border: none;
      color: var(--text-sub);
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .tab-btn.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .tab-btn:hover:not(.active) {
      color: var(--text-main);
      background: rgba(255, 255, 255, 0.04);
    }

    .view-toolbar {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .table-filter-input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 7px;
      padding: 5px 10px;
      color: white;
      font-size: 0.78rem;
      font-family: inherit;
      width: 180px;
      outline: none;
    }
    .table-filter-input:focus {
      border-color: var(--emerald);
    }

    .view-content {
      flex: 1;
      overflow: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* Data Table */
    .table-wrapper {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: auto;
      flex: 1;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      text-align: left;
    }

    th {
      background: rgba(12, 18, 30, 0.98);
      color: #cbd5e1;
      font-weight: 700;
      padding: 10px 14px;
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 10;
      white-space: nowrap;
      font-family: var(--mono);
      font-size: 0.74rem;
      user-select: none;
      cursor: pointer;
      transition: background 0.15s;
    }

    th:hover {
      background: rgba(20, 30, 48, 0.98);
      color: white;
    }

    th .sort-arrow {
      margin-left: 4px;
      color: var(--emerald);
      font-size: 0.7rem;
    }

    td {
      padding: 8px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-main);
      white-space: nowrap;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--mono);
      font-size: 0.78rem;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
    }

    .cell-null {
      color: #64748b;
      font-style: italic;
      font-size: 0.72rem;
    }

    .cell-bool-true {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-radius: 4px;
      padding: 2px 6px;
      font-weight: 700;
      font-size: 0.7rem;
      display: inline-block;
    }

    .cell-bool-false {
      background: rgba(244, 63, 94, 0.15);
      color: #fb7185;
      border-radius: 4px;
      padding: 2px 6px;
      font-weight: 700;
      font-size: 0.7rem;
      display: inline-block;
    }

    .cell-id {
      color: #38bdf8;
      font-weight: 700;
    }

    /* SQL Editor View */
    .sql-view {
      display: flex;
      flex-direction: column;
      gap: 14px;
      height: 100%;
    }

    .sql-input {
      width: 100%;
      height: 130px;
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px;
      color: #38bdf8;
      font-family: var(--mono);
      font-size: 0.88rem;
      outline: none;
      resize: vertical;
      line-height: 1.5;
    }

    .sql-input:focus {
      border-color: var(--emerald);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .snippets-bar {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
    }

    .snippet-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 4px 10px;
      color: #94a3b8;
      font-size: 0.72rem;
      font-family: var(--mono);
      cursor: pointer;
      transition: all 0.15s;
    }

    .snippet-btn:hover {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      border-top: 1px solid var(--card-border);
      background: rgba(12, 18, 30, 0.95);
      font-size: 0.8rem;
      color: var(--text-sub);
      flex-shrink: 0;
      border-radius: 0 0 12px 12px;
    }

    .page-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .limit-select {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      padding: 3px 6px;
      font-size: 0.75rem;
      outline: none;
    }

    /* Modal / Inspector Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-box {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 28px 24px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.7);
    }

    .inspector-drawer {
      background: rgba(12, 18, 30, 0.98);
      border-left: 1px solid var(--card-border);
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 480px;
      max-width: 90vw;
      z-index: 500;
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 30px rgba(0,0,0,0.5);
      backdrop-filter: blur(16px);
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .inspector-drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .field-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--emerald);
      font-family: var(--mono);
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .field-val {
      font-size: 0.82rem;
      font-family: var(--mono);
      word-break: break-all;
      color: var(--text-main);
    }

    .login-box {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 32px 28px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      text-align: center;
    }

    .login-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      font-size: 0.9rem;
      margin-bottom: 12px;
      outline: none;
      font-family: inherit;
    }

    .login-input:focus {
      border-color: var(--emerald);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    /* Toast Notification */
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toast {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      color: white;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <a href="/" class="brand">
      <div class="brand-icon">🗄️</div>
      <div class="brand-text">
        <h1>EverGreen Studio <span class="badge badge-emerald"><span class="status-dot"></span> SQLite 3</span></h1>
        <p id="header-db-sub">packages/database/prisma/dev.db</p>
      </div>
    </a>

    <div class="header-links">
      <div id="auth-status-container" class="auth-badge">
        <span id="auth-indicator" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8;"></span>
        <span id="auth-user-label" style="font-weight:600;">Authenticating...</span>
        <span id="auth-role-badge" class="badge" style="display:none;"></span>
      </div>

      <a href="http://localhost:4000" target="_blank" class="btn btn-ghost" title="Open Main Application">🌐 Web App (4000)</a>
      <a href="http://localhost:4301/health" target="_blank" class="btn btn-ghost" title="View Core API Health Hub">🌱 API Health (4301)</a>
      <a href="http://localhost:4000/api/docs" target="_blank" class="btn btn-ghost" title="Open Swagger API Explorer">📑 Swagger Docs</a>
      <button class="btn btn-ghost" id="logout-btn" onclick="handleLogout()" style="display:none; color:#fb7185;">🚪 Sign Out</button>
      <button class="btn btn-primary" onclick="loadTables()">↻ Refresh DB</button>
    </div>
  </header>

  <div class="studio-container">
    <!-- Left Sidebar: Tables List -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" id="table-search" class="search-input" placeholder="Search tables (Ctrl+K)..." oninput="filterTables()">
        </div>
        <div class="category-pills">
          <button class="cat-btn active" onclick="setCategoryFilter('all', this)">All</button>
          <button class="cat-btn" onclick="setCategoryFilter('operations', this)">Operations</button>
          <button class="cat-btn" onclick="setCategoryFilter('commerce', this)">Commerce</button>
          <button class="cat-btn" onclick="setCategoryFilter('auth', this)">Auth & Users</button>
        </div>
      </div>
      <div class="table-list" id="table-list-container">
        <!-- Tables injected here -->
      </div>
      <div class="sidebar-footer">
        <span id="sidebar-tables-count">0 tables</span>
        <span id="sidebar-db-size">dev.db</span>
      </div>
    </aside>

    <!-- Main View -->
    <main class="main-view">
      <div class="view-tabs-bar">
        <div class="tabs">
          <button class="tab-btn active" id="tab-btn-data" onclick="switchTab('data')">📋 Table Data</button>
          <button class="tab-btn" id="tab-btn-schema" onclick="switchTab('schema')">🔑 Schema & Columns</button>
          <button class="tab-btn" id="tab-btn-sql" onclick="switchTab('sql')">⚡ SQL Console</button>
        </div>

        <div class="view-toolbar">
          <div style="font-size: 0.8rem; color: var(--text-sub); display: flex; align-items: center; gap: 8px;">
            <span id="active-table-title" style="font-weight: 700; color: white;">User</span>
            <span id="active-table-count" class="count-badge">0 rows</span>
          </div>

          <input type="text" id="active-table-filter" class="table-filter-input" placeholder="Filter rows..." oninput="filterVisibleRows()" title="Filter currently loaded records">
          <button class="btn btn-ghost" onclick="exportCurrentTable('csv')" title="Download as CSV">📥 CSV</button>
          <button class="btn btn-ghost" onclick="exportCurrentTable('json')" title="Download as JSON">📋 JSON</button>
          <button class="btn btn-ghost" onclick="loadTableData()" title="Reload Table">↻</button>
        </div>
      </div>

      <div class="view-content" id="view-content-area">
        <!-- Data Grid View -->
        <div id="data-view-pane" style="display: flex; flex-direction: column; height: 100%;">
          <div class="table-wrapper">
            <table id="data-table">
              <thead id="data-thead"></thead>
              <tbody id="data-tbody"></tbody>
            </table>
          </div>
          <div class="pagination-bar">
            <span id="pagination-info">Showing 0 of 0</span>
            <div class="page-controls">
              <label style="font-size: 0.75rem; color: var(--text-sub);">Page size:</label>
              <select class="limit-select" id="page-size-select" onchange="changeLimit(this.value)">
                <option value="10">10</option>
                <option value="25" selected>25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <button class="btn btn-ghost" id="prev-page-btn" onclick="prevPage()">← Prev</button>
              <span id="page-num-label" style="font-family: var(--mono);">Page 1</span>
              <button class="btn btn-ghost" id="next-page-btn" onclick="nextPage()">Next →</button>
            </div>
          </div>
        </div>

        <!-- Schema Inspector View -->
        <div id="schema-view-pane" style="display: none; height: 100%;">
          <div class="table-wrapper">
            <table id="schema-table">
              <thead>
                <tr>
                  <th>Column ID</th>
                  <th>Name</th>
                  <th>Data Type</th>
                  <th>Primary Key</th>
                  <th>Not Null</th>
                  <th>Default Value</th>
                </tr>
              </thead>
              <tbody id="schema-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- SQL Console View -->
        <div id="sql-view-pane" class="sql-view" style="display: none;">
          <div class="snippets-bar">
            <span style="font-size: 0.72rem; color: var(--text-sub); display: flex; align-items: center;">Quick Snippets:</span>
            <button class="snippet-btn" onclick="setQuery('SELECT id, username, role, name, email FROM User;')">Users & Staff</button>
            <button class="snippet-btn" onclick="setQuery('SELECT id, lotNumber, supplierName, netWeightKg, status FROM InwardBatch ORDER BY id DESC LIMIT 10;')">Inward Batches</button>
            <button class="snippet-btn" onclick="setQuery('SELECT id, date, shift, totalProductionKg FROM DailyProduction ORDER BY id DESC LIMIT 10;')">Daily Production</button>
            <button class="snippet-btn" onclick="setQuery('SELECT id, invoiceNo, customerName, total, status FROM Invoice ORDER BY id DESC LIMIT 10;')">Invoices</button>
            <button class="snippet-btn" onclick="setQuery('SELECT s.id, u.username, s.ipAddress, s.lastActive FROM Session s JOIN User u ON s.userId = u.id WHERE s.isValid = 1;')">Active Sessions</button>
            <button class="snippet-btn" onclick="setQuery('SELECT name, count(*) as tables FROM sqlite_master WHERE type=\\'table\\' GROUP BY name;')">Schema Overview</button>
          </div>
          <textarea id="sql-query-input" class="sql-input" placeholder="Enter custom SQL query (e.g. SELECT * FROM User;)...">SELECT * FROM User LIMIT 20;</textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary" onclick="executeCustomSql()">▶ Run Query (Ctrl+Enter)</button>
              <button class="btn btn-ghost" onclick="exportSqlResults('csv')">📥 Export CSV</button>
              <button class="btn btn-ghost" onclick="exportSqlResults('json')">📋 Export JSON</button>
            </div>
            <span id="sql-latency" style="font-family: var(--mono); font-size: 0.75rem; color: #38bdf8;"></span>
          </div>
          <div class="table-wrapper" style="flex: 1; margin-top: 10px;">
            <table id="sql-results-table">
              <thead id="sql-results-thead"></thead>
              <tbody id="sql-results-tbody"></tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- Record Inspector Drawer -->
  <aside id="record-drawer" class="inspector-drawer">
    <div class="drawer-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.1rem;">🔍</span>
        <div>
          <h3 id="drawer-title" style="font-size: 0.95rem; font-weight: 800; color: white;">Record Inspector</h3>
          <p id="drawer-subtitle" style="font-size: 0.72rem; color: var(--text-sub);">Table Details</p>
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="btn btn-ghost" onclick="copyDrawerJson()" title="Copy record as JSON">📋 Copy JSON</button>
        <button class="btn btn-ghost" onclick="closeDrawer()" style="padding: 4px 8px;">✕</button>
      </div>
    </div>
    <div class="drawer-content" id="drawer-fields">
      <!-- Injected field rows -->
    </div>
  </aside>

  <!-- Login Modal Overlay -->
  <div id="login-modal" class="modal-overlay" style="display: none;">
    <div class="login-box">
      <div style="font-size: 36px; margin-bottom: 10px;">🗄️</div>
      <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;">EverGreen Studio Access</h2>
      <p style="font-size: 0.8rem; color: var(--text-sub); margin-bottom: 18px;">Administrator authentication required to inspect and query the database.</p>
      
      <div id="login-error" style="display: none; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 14px;"></div>

      <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 11px; margin-bottom: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);" onclick="quickAdminLogin()">
        ⚡ Quick Sign In as Author (Admin)
      </button>

      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px; color: var(--text-sub); font-size: 0.75rem;">
        <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
        <span>or enter credentials</span>
        <div style="flex:1; height:1px; background:rgba(255,255,255,0.1);"></div>
      </div>

      <input type="text" id="login-username" class="login-input" placeholder="Username (e.g. author)" value="author" autofocus>
      <input type="password" id="login-password" class="login-input" placeholder="Password (e.g. author123)" value="author123" onkeydown="if(event.key==='Enter') executeLogin()">
      
      <div style="display: flex; gap: 10px; margin-top: 4px;">
        <button class="btn btn-ghost" style="flex: 1; justify-content: center; padding: 10px;" onclick="executeLogin()">Sign In</button>
      </div>
      <div style="margin-top: 18px;">
        <a href="http://localhost:4000" target="_blank" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none;">← Return to Staff Web App (4000)</a>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container" class="toast-container"></div>

  <script>
    function escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function showToast(msg, icon = '✓') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = '<span>' + icon + '</span><span>' + escapeHtml(msg) + '</span>';
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.2s';
        setTimeout(() => toast.remove(), 200);
      }, 3000);
    }

    let allTables = [];
    let currentTable = '${initialTable}' || 'User';
    let currentPage = 1;
    let limit = 25;
    let totalRows = 0;
    let activeTab = 'data';
    let currentUser = null;
    let currentColumns = [];
    let currentRows = [];
    let currentSortCol = null;
    let currentSortOrder = 'ASC';
    let currentCategory = 'all';
    let activeDrawerRow = null;
    let lastSqlResults = null;

    function getStoredToken() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('evergreen_studio_token', urlToken);
        const cleanUrl = window.location.pathname + (window.location.search.replace(/[?&]token=[^&]+/, '').replace(/^&/, '?') || '');
        history.replaceState(null, '', cleanUrl);
        return urlToken;
      }
      return localStorage.getItem('evergreen_studio_token') || localStorage.getItem('token');
    }

    function getAuthHeaders() {
      const token = getStoredToken();
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      return headers;
    }

    async function checkAuth() {
      const token = getStoredToken();
      if (!token) {
        setUnauthenticatedUI();
        document.getElementById('login-modal').style.display = 'flex';
        return false;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            currentUser = data.user;
            setAuthenticatedUI(data.user);
            document.getElementById('login-modal').style.display = 'none';
            return true;
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      }

      setUnauthenticatedUI();
      document.getElementById('login-modal').style.display = 'flex';
      return false;
    }

    function setAuthenticatedUI(user) {
      document.getElementById('auth-indicator').style.background = '#10b981';
      document.getElementById('auth-user-label').innerText = user.name || user.username;
      const roleBadge = document.getElementById('auth-role-badge');
      roleBadge.innerText = user.role;
      roleBadge.style.display = 'inline-block';
      roleBadge.className = 'badge ' + (user.role === 'ADMIN' ? 'badge-emerald' : 'badge-blue');
      document.getElementById('logout-btn').style.display = 'inline-flex';
    }

    function setUnauthenticatedUI() {
      document.getElementById('auth-indicator').style.background = '#f43f5e';
      document.getElementById('auth-user-label').innerText = 'Unauthenticated';
      document.getElementById('auth-role-badge').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'none';
    }

    async function quickAdminLogin() {
      document.getElementById('login-username').value = 'author';
      document.getElementById('login-password').value = 'author123';
      await executeLogin();
    }

    async function executeLogin() {
      const u = document.getElementById('login-username').value.trim();
      const p = document.getElementById('login-password').value.trim();
      const errBox = document.getElementById('login-error');

      if (!u || !p) {
        errBox.innerText = 'Please enter both username and password.';
        errBox.style.display = 'block';
        return;
      }

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p }),
          cache: 'no-store'
        });

        const data = await res.json();
        if (!res.ok) {
          errBox.innerText = data.message || 'Authentication failed. Check credentials.';
          errBox.style.display = 'block';
          return;
        }

        localStorage.setItem('evergreen_studio_token', data.token);
        currentUser = data.user;
        setAuthenticatedUI(data.user);
        document.getElementById('login-modal').style.display = 'none';
        errBox.style.display = 'none';
        showToast('Signed in successfully as ' + data.user.username);
        loadTables();
      } catch (err) {
        errBox.innerText = 'Connection error: ' + err.message;
        errBox.style.display = 'block';
      }
    }

    async function handleLogout() {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
      } catch {}
      localStorage.removeItem('evergreen_studio_token');
      currentUser = null;
      setUnauthenticatedUI();
      document.getElementById('login-modal').style.display = 'flex';
      showToast('Signed out of Studio');
    }

    async function loadTables() {
      const authed = await checkAuth();
      if (!authed) return;

      try {
        const [tablesRes, statsRes] = await Promise.all([
          fetch('/api/tables', { headers: getAuthHeaders(), cache: 'no-store' }),
          fetch('/api/stats', { cache: 'no-store' })
        ]);

        if (tablesRes.status === 401) {
          checkAuth();
          return;
        }

        allTables = await tablesRes.json();
        if (statsRes.ok) {
          const stats = await statsRes.json();
          document.getElementById('sidebar-db-size').innerText = stats.fileSizeKB + ' KB';
          document.getElementById('header-db-sub').innerText = stats.target + ' (' + stats.fileSizeKB + ' KB)';
        }

        document.getElementById('sidebar-tables-count').innerText = allTables.length + ' tables';
        filterTables();

        if (allTables.length > 0) {
          if (!allTables.some(t => t.name === currentTable)) {
            currentTable = allTables[0].name;
          }
          selectTable(currentTable);
        }
      } catch (err) {
        console.error('Failed to load tables:', err);
      }
    }

    function setCategoryFilter(cat, btn) {
      currentCategory = cat;
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      filterTables();
    }

    function filterTables() {
      const q = document.getElementById('table-search').value.toLowerCase();
      let filtered = allTables.filter(t => t.name.toLowerCase().includes(q));

      if (currentCategory === 'operations') {
        const ops = ['Inward', 'Production', 'Spinning', 'Machine', 'Quality', 'Inventory', 'Waste', 'Maintenance'];
        filtered = filtered.filter(t => ops.some(keyword => t.name.toLowerCase().includes(keyword.toLowerCase())));
      } else if (currentCategory === 'commerce') {
        const comm = ['Invoice', 'Catalogue', 'Sales', 'Customer', 'Payment', 'Order', 'Ledger', 'Billing'];
        filtered = filtered.filter(t => comm.some(keyword => t.name.toLowerCase().includes(keyword.toLowerCase())));
      } else if (currentCategory === 'auth') {
        const auth = ['User', 'Session', 'Role', 'Audit', 'Setting', 'Log'];
        filtered = filtered.filter(t => auth.some(keyword => t.name.toLowerCase().includes(keyword.toLowerCase())));
      }

      renderTableList(filtered);
    }

    function renderTableList(tables) {
      const container = document.getElementById('table-list-container');
      container.innerHTML = tables.map(t => 
        '<div class="table-item ' + (t.name === currentTable ? 'active' : '') + '" onclick="selectTable(\\'' + t.name + '\\')">' +
          '<div class="table-item-name">' +
            '<span style="opacity:0.7;">📄</span>' +
            '<span>' + t.name + '</span>' +
          '</div>' +
          '<span class="count-badge">' + t.count.toLocaleString() + '</span>' +
        '</div>'
      ).join('');
    }

    function selectTable(tableName) {
      currentTable = tableName;
      currentPage = 1;
      currentSortCol = null;
      currentSortOrder = 'ASC';
      document.querySelectorAll('.table-item').forEach(el => {
        if (el.textContent.includes(tableName)) el.classList.add('active');
        else el.classList.remove('active');
      });
      document.getElementById('active-table-title').innerText = tableName;
      history.replaceState(null, '', '/table/' + tableName);
      loadTableData();
    }

    async function loadTableData() {
      try {
        let url = '/api/table/' + currentTable + '?page=' + currentPage + '&limit=' + limit;
        if (currentSortCol) {
          url += '&sort=' + encodeURIComponent(currentSortCol) + '&order=' + currentSortOrder;
        }

        const res = await fetch(url, {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });

        if (res.status === 401) {
          checkAuth();
          return;
        }
        if (!res.ok) {
          if (res.status === 404) {
            window.location.href = '/table/' + currentTable;
            return;
          }
        }

        const data = await res.json();
        totalRows = data.totalRows;
        currentColumns = data.columns || [];
        currentRows = data.rows || [];

        document.getElementById('active-table-count').innerText = totalRows.toLocaleString() + ' rows';
        renderDataGrid(currentColumns, currentRows);
        renderSchemaView(currentColumns);
        updatePagination(data.totalRows);
      } catch (err) {
        console.error('Failed to fetch table data:', err);
      }
    }

    function renderDataGrid(columns, rows) {
      const thead = document.getElementById('data-thead');
      const tbody = document.getElementById('data-tbody');

      thead.innerHTML = '<tr>' + columns.map(c => {
        let sortIcon = '';
        if (currentSortCol === c.name) {
          sortIcon = '<span class="sort-arrow">' + (currentSortOrder === 'ASC' ? '▲' : '▼') + '</span>';
        }
        return '<th onclick="sortByCol(\\'' + c.name + '\\')">' + 
          (c.pk ? '🔑 ' : '') + c.name + 
          ' <span style="opacity:0.5; font-size:0.65rem;">(' + c.type + ')</span>' + 
          sortIcon + 
        '</th>';
      }).join('') + '</tr>';

      if (!rows || rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + columns.length + '" style="text-align:center; padding: 40px; color: #94a3b8;">No records found in table ' + currentTable + '.</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map((r, rowIndex) => {
        return '<tr onclick="openRecordInspector(' + rowIndex + ')">' + columns.map(c => {
          let val = r[c.name];
          if (val === null || val === undefined) return '<td class="cell-null">null</td>';
          if (typeof val === 'boolean') return '<td><span class="' + (val ? 'cell-bool-true' : 'cell-bool-false') + '">' + (val ? 'true' : 'false') + '</span></td>';
          if (c.name.toLowerCase() === 'id') return '<td class="cell-id">' + escapeHtml(String(val)) + '</td>';
          if (typeof val === 'object') return '<td>' + escapeHtml(JSON.stringify(val)) + '</td>';
          return '<td title="' + escapeHtml(String(val)) + '">' + escapeHtml(String(val)) + '</td>';
        }).join('') + '</tr>';
      }).join('');
    }

    function sortByCol(colName) {
      if (currentSortCol === colName) {
        currentSortOrder = currentSortOrder === 'ASC' ? 'DESC' : 'ASC';
      } else {
        currentSortCol = colName;
        currentSortOrder = 'ASC';
      }
      loadTableData();
    }

    function filterVisibleRows() {
      const q = document.getElementById('active-table-filter').value.toLowerCase();
      if (!q) {
        renderDataGrid(currentColumns, currentRows);
        return;
      }
      const filtered = currentRows.filter(r => {
        return Object.values(r).some(val => String(val || '').toLowerCase().includes(q));
      });
      renderDataGrid(currentColumns, filtered);
    }

    function openRecordInspector(rowIndex) {
      const row = currentRows[rowIndex];
      if (!row) return;
      activeDrawerRow = row;

      document.getElementById('drawer-title').innerText = currentTable + ' Record';
      document.getElementById('drawer-subtitle').innerText = 'ID: ' + (row.id || 'N/A');

      const container = document.getElementById('drawer-fields');
      container.innerHTML = Object.entries(row).map(([k, v]) => {
        let displayVal = v;
        if (v === null || v === undefined) displayVal = '<span class="cell-null">null</span>';
        else if (typeof v === 'boolean') displayVal = v ? '<span class="cell-bool-true">true</span>' : '<span class="cell-bool-false">false</span>';
        else if (typeof v === 'object') displayVal = '<pre style="background:rgba(0,0,0,0.4); padding:6px; border-radius:6px; font-size:0.75rem; color:#38bdf8;">' + escapeHtml(JSON.stringify(v, null, 2)) + '</pre>';
        else displayVal = escapeHtml(String(v));

        return '<div class="field-row">' +
          '<div class="field-label">' +
            '<span>' + escapeHtml(k) + '</span>' +
            '<button class="btn btn-ghost" style="padding:1px 6px; font-size:0.65rem;" onclick="event.stopPropagation(); copyText(\\'' + escapeHtml(String(v || '')) + '\\')">Copy</button>' +
          '</div>' +
          '<div class="field-val">' + displayVal + '</div>' +
        '</div>';
      }).join('');

      document.getElementById('record-drawer').classList.add('open');
    }

    function closeDrawer() {
      document.getElementById('record-drawer').classList.remove('open');
    }

    function copyDrawerJson() {
      if (!activeDrawerRow) return;
      navigator.clipboard.writeText(JSON.stringify(activeDrawerRow, null, 2));
      showToast('Record JSON copied to clipboard');
    }

    function copyText(str) {
      navigator.clipboard.writeText(str);
      showToast('Copied: ' + (str.length > 20 ? str.slice(0, 20) + '…' : str));
    }

    function renderSchemaView(columns) {
      const tbody = document.getElementById('schema-tbody');
      tbody.innerHTML = columns.map(c => {
        let typeBadge = 'badge-emerald';
        const t = String(c.type || '').toUpperCase();
        if (t.includes('INT')) typeBadge = 'badge-blue';
        else if (t.includes('BOOL')) typeBadge = 'badge-amber';
        else if (t.includes('REAL') || t.includes('FLOAT') || t.includes('NUM')) typeBadge = 'badge-purple';

        return '<tr>' +
          '<td>' + c.cid + '</td>' +
          '<td style="font-weight:700; color:white;">' + c.name + '</td>' +
          '<td><span class="badge ' + typeBadge + '">' + c.type + '</span></td>' +
          '<td>' + (c.pk ? '<span class="badge badge-emerald">🔑 PRIMARY KEY</span>' : '—') + '</td>' +
          '<td>' + (c.notnull ? '<span class="badge badge-rose">REQUIRED</span>' : '<span style="opacity:0.6;">OPTIONAL</span>') + '</td>' +
          '<td>' + (c.dflt_value ?? '<span class="cell-null">NULL</span>') + '</td>' +
        '</tr>';
      }).join('');
    }

    function updatePagination(total) {
      const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
      const end = Math.min(currentPage * limit, total);
      document.getElementById('pagination-info').innerText = total > 0 ? 'Showing ' + start + '–' + end + ' of ' + total.toLocaleString() : '0 records';
      document.getElementById('page-num-label').innerText = 'Page ' + currentPage;
      document.getElementById('prev-page-btn').disabled = currentPage <= 1;
      document.getElementById('next-page-btn').disabled = end >= total;
    }

    function changeLimit(val) {
      limit = Number(val);
      currentPage = 1;
      loadTableData();
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        loadTableData();
      }
    }

    function nextPage() {
      if (currentPage * limit < totalRows) {
        currentPage++;
        loadTableData();
      }
    }

    function switchTab(tab) {
      activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('tab-btn-' + tab).classList.add('active');

      document.getElementById('data-view-pane').style.display = tab === 'data' ? 'flex' : 'none';
      document.getElementById('schema-view-pane').style.display = tab === 'schema' ? 'block' : 'none';
      document.getElementById('sql-view-pane').style.display = tab === 'sql' ? 'flex' : 'none';
      closeDrawer();
    }

    function setQuery(sql) {
      document.getElementById('sql-query-input').value = sql;
      executeCustomSql();
    }

    async function executeCustomSql() {
      const sql = document.getElementById('sql-query-input').value.trim();
      if (!sql) return;
      try {
        const res = await fetch('/api/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({ query: sql }),
          cache: 'no-store'
        });

        if (res.status === 401) {
          checkAuth();
          return;
        }

        const data = await res.json();
        document.getElementById('sql-latency').innerText = '⚡ ' + data.latencyMs + ' ms';
        const thead = document.getElementById('sql-results-thead');
        const tbody = document.getElementById('sql-results-tbody');

        if (data.error) {
          thead.innerHTML = '';
          tbody.innerHTML = '<tr><td style="color:#fb7185; padding: 16px;">❌ SQL Error: ' + escapeHtml(data.error) + '</td></tr>';
          showToast('SQL Execution Error', '❌');
          return;
        }

        lastSqlResults = data.rows || [];

        if (!data.rows || data.rows.length === 0) {
          thead.innerHTML = '';
          tbody.innerHTML = '<tr><td style="color:#94a3b8; padding: 16px;">Query executed successfully. 0 rows returned.</td></tr>';
          showToast('Query finished (0 rows)');
          return;
        }

        const cols = Object.keys(data.rows[0]);
        thead.innerHTML = '<tr>' + cols.map(c => '<th>' + escapeHtml(c) + '</th>').join('') + '</tr>';
        tbody.innerHTML = data.rows.map(r => 
          '<tr>' + cols.map(c => '<td>' + (r[c] === null ? '<span class="cell-null">null</span>' : escapeHtml(String(r[c]))) + '</td>').join('') + '</tr>'
        ).join('');

        showToast('Query returned ' + data.rows.length + ' rows in ' + data.latencyMs + 'ms');
      } catch (err) {
        console.error('SQL query failed:', err);
      }
    }

    function exportCurrentTable(format) {
      if (!currentRows || currentRows.length === 0) {
        showToast('No rows to export', '⚠️');
        return;
      }
      downloadDataset(currentRows, currentTable + '_page' + currentPage, format);
    }

    function exportSqlResults(format) {
      if (!lastSqlResults || lastSqlResults.length === 0) {
        showToast('Run a query with results first', '⚠️');
        return;
      }
      downloadDataset(lastSqlResults, 'sql_query_result', format);
    }

    function downloadDataset(rows, filenamePrefix, format) {
      if (format === 'json') {
        const jsonStr = JSON.stringify(rows, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        triggerDownload(blob, filenamePrefix + '.json');
        showToast('Exported ' + rows.length + ' records as JSON');
      } else if (format === 'csv') {
        const cols = Object.keys(rows[0] || {});
        const headerLine = cols.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',');
        const rowLines = rows.map(r => cols.map(c => {
          const val = r[c];
          if (val === null || val === undefined) return '""';
          return '"' + String(val).replace(/"/g, '""') + '"';
        }).join(','));
        const csvStr = [headerLine, ...rowLines].join('\\n');
        const blob = new Blob([csvStr], { type: 'text/csv' });
        triggerDownload(blob, filenamePrefix + '.csv');
        showToast('Exported ' + rows.length + ' records as CSV');
      }
    }

    function triggerDownload(blob, filename) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('table-search')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && activeTab === 'sql') {
        e.preventDefault();
        executeCustomSql();
      }
      if (e.key === 'Escape') {
        closeDrawer();
      }
    });

    loadTables();
  </script>
</body>
</html>`;
}

// Server handler
const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, 'http://' + req.headers.host);
  const pathname = urlObj.pathname;
  const acceptsHtml = req.headers.accept?.includes('text/html');

  // Strict No-Cache headers on every response
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const authContext = await authenticateRequest(req);

    // Route: POST /api/auth/login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { username, password } = JSON.parse(body || '{}');
          if (!username || !password) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(safeJson({ error: 'BadRequest', message: 'Username and password required.' }));
            return;
          }

          const user = await prisma.user.findUnique({ where: { username } });
          if (!user) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(safeJson({ error: 'Unauthorized', message: 'Invalid username or password.' }));
            return;
          }

          let passwordMatch = false;
          if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
            passwordMatch = await bcrypt.compare(password, user.password);
          } else {
            passwordMatch = user.password === password;
          }

          if (!passwordMatch) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(safeJson({ error: 'Unauthorized', message: 'Invalid username or password.' }));
            return;
          }

          // Create active session record in SQLite
          const session = await prisma.session.create({
            data: {
              userId: user.id,
              ipAddress: req.socket.remoteAddress || '127.0.0.1',
              userAgent: req.headers['user-agent'] || 'Database Studio',
              location: 'Local Development',
              device: 'Database Explorer',
              isValid: true,
            },
          });

          const token = jwt.sign(
            { username: user.username, sub: user.id, role: user.role, sessionId: session.id },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `evergreen_token=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax`,
          });
          res.end(safeJson({
            token,
            user: { id: user.id, username: user.username, name: user.name, role: user.role },
          }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(safeJson({ error: 'ServerError', message: err.message }));
        }
      });
      return;
    }

    // Route: POST /api/auth/logout
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      if (authContext) {
        await prisma.session.update({
          where: { id: authContext.session.id },
          data: { isValid: false },
        }).catch(() => {});
      }
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': 'evergreen_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      });
      res.end(safeJson({ success: true }));
      return;
    }

    // Route: GET /api/auth/me
    if (pathname === '/api/auth/me' && (req.method === 'GET' || req.method === 'HEAD')) {
      if (authContext) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeJson({
          authenticated: true,
          user: authContext.user,
          session: { id: authContext.session.id, lastActive: authContext.session.lastActive },
        }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeJson({ authenticated: false }));
      }
      return;
    }

    const validTables = await getValidTables();

    // Route: GET / (Studio Home)
    if (pathname === '/' && (req.method === 'GET' || req.method === 'HEAD')) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      if (req.method === 'HEAD') { res.end(); return; }
      res.end(renderStudioHtml(validTables[0] || 'User'));
      return;
    }

    // Route: GET /table/:tableName (Studio Table View)
    if (pathname.startsWith('/table/') && (req.method === 'GET' || req.method === 'HEAD')) {
      const tableName = decodeURIComponent(pathname.replace('/table/', '')).trim();
      if (validTables.includes(tableName)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        if (req.method === 'HEAD') { res.end(); return; }
        res.end(renderStudioHtml(tableName));
        return;
      }
      // Table does NOT exist -> 404
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      if (req.method === 'HEAD') { res.end(); return; }
      res.end(render404Html(pathname, 'Table "' + tableName + '" does not exist in SQLite database.'));
      return;
    }

    // --- PROTECTED API ROUTES BELOW ---
    // If client is requesting /api/* (except auth routes handled above), require authentication
    if (pathname.startsWith('/api/') && !authContext) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(safeJson({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'EverGreen authentication required. Please log in or provide a valid session token.',
      }));
      return;
    }

    // Route: GET /api/tables
    if (pathname === '/api/tables' && (req.method === 'GET' || req.method === 'HEAD')) {
      const counts = await Promise.all(
        validTables.map(async name => {
          try {
            const countRes = await prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM "' + name + '";');
            return { name, count: Number(countRes[0]?.cnt || 0) };
          } catch {
            return { name, count: 0 };
          }
        })
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeJson(counts));
      return;
    }

    // Route: GET /api/table/:tableName
    if (pathname.startsWith('/api/table/') && (req.method === 'GET' || req.method === 'HEAD')) {
      const tableName = decodeURIComponent(pathname.replace('/api/table/', '')).trim();
      if (!validTables.includes(tableName)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        if (req.method === 'HEAD') { res.end(); return; }
        res.end(safeJson({ statusCode: 404, error: 'Not Found', message: 'Table "' + tableName + '" not found.' }));
        return;
      }

      const page = Math.max(1, Number(urlObj.searchParams.get('page') || 1));
      const limit = Math.min(100, Math.max(5, Number(urlObj.searchParams.get('limit') || 25)));
      const offset = (page - 1) * limit;

      const columns = await prisma.$queryRawUnsafe('PRAGMA table_info("' + tableName + '");');
      const columnNames = columns.map(c => c.name);

      let orderClause = '';
      const sortCol = urlObj.searchParams.get('sort');
      const sortOrder = urlObj.searchParams.get('order')?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      if (sortCol && columnNames.includes(sortCol)) {
        orderClause = ` ORDER BY "${sortCol}" ${sortOrder}`;
      }

      const [totalRowsRes, rows] = await Promise.all([
        prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM "' + tableName + '";'),
        prisma.$queryRawUnsafe('SELECT * FROM "' + tableName + '"' + orderClause + ' LIMIT ' + limit + ' OFFSET ' + offset + ';'),
      ]);

      const totalRows = Number(totalRowsRes[0]?.cnt || 0);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (req.method === 'HEAD') { res.end(); return; }
      res.end(safeJson({ tableName, columns, totalRows, page, limit, rows }));
      return;
    }

    // Route: POST /api/query
    if (pathname === '/api/query' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { query } = JSON.parse(body || '{}');
          if (!query || typeof query !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(safeJson({ error: 'Query parameter required.' }));
            return;
          }
          const t0 = performance.now();
          const rows = await prisma.$queryRawUnsafe(query);
          const latencyMs = Math.round((performance.now() - t0) * 100) / 100;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(safeJson({ latencyMs, rows }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(safeJson({ error: err.message }));
        }
      });
      return;
    }

    // Route: GET /api/stats (Safe stats, no internal absolute system file paths leaked)
    if (pathname === '/api/stats' && (req.method === 'GET' || req.method === 'HEAD')) {
      let fileSizeKB = 0;
      try {
        const stat = fs.statSync(dbFilePath);
        fileSizeKB = Math.round(stat.size / 1024);
      } catch {}

      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (req.method === 'HEAD') { res.end(); return; }
      res.end(safeJson({
        database: 'dev.db',
        provider: 'SQLite 3',
        target: 'packages/database/prisma/dev.db',
        fileSizeKB,
        totalTables: validTables.length,
        status: 'ONLINE',
      }));
      return;
    }

    // ── 404 NOT FOUND FOR ANY UNMATCHED ROUTE ──
    res.writeHead(404, {
      'Content-Type': acceptsHtml ? 'text/html; charset=utf-8' : 'application/json',
    });
    if (acceptsHtml) {
      res.end(render404Html(pathname, 'The requested database route does not exist.'));
    } else {
      res.end(safeJson({
        statusCode: 404,
        error: 'Not Found',
        message: 'The requested database resource was not found.',
      }));
    }

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(safeJson({ error: 'ServerError', message: err.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🗄️ EverGreen Database Studio running on http://localhost:' + PORT + '/');
});

process.on('SIGINT', () => { prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', () => { prisma.$disconnect(); process.exit(0); });
