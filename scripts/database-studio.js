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
      --bg: #090e17;
      --card-bg: rgba(18, 26, 43, 0.7);
      --card-border: rgba(30, 41, 59, 0.8);
      --text-main: #f8fafc;
      --text-sub: #94a3b8;
      --emerald: #10b981;
      --emerald-glow: rgba(16, 185, 129, 0.25);
      --emerald-sub: #059669;
      --teal: #14b8a6;
      --blue: #3b82f6;
      --amber: #f59e0b;
      --rose: #f43f5e;
      --font: 'Outfit', sans-serif;
      --mono: 'JetBrains Mono', monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 10% 10%, rgba(16, 185, 129, 0.08) 0px, transparent 50%),
        radial-gradient(at 90% 90%, rgba(59, 130, 246, 0.06) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text-main);
      font-family: var(--font);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Header */
    header {
      background: rgba(9, 14, 23, 0.95);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
      backdrop-filter: blur(12px);
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
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 0 16px var(--emerald-glow);
    }

    .brand-text h1 {
      font-size: 1.1rem;
      font-weight: 800;
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
    }

    .badge-emerald {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .header-links {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 7px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
      font-family: inherit;
      transition: all 0.2s;
    }

    .btn-ghost {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-main);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-1px);
    }

    .auth-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(18, 26, 43, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 10px;
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
      width: 280px;
      background: rgba(14, 20, 32, 0.85);
      border-right: 1px solid var(--card-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      backdrop-filter: blur(10px);
    }

    .sidebar-header {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .search-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 7px 12px;
      color: white;
      font-family: inherit;
      font-size: 0.8rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--emerald);
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

    .count-badge {
      font-size: 0.7rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 1px 6px;
      border-radius: 99px;
      font-family: var(--mono);
      color: #94a3b8;
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
      background: rgba(18, 26, 43, 0.6);
      border-bottom: 1px solid var(--card-border);
      flex-shrink: 0;
    }

    .tabs {
      display: flex;
      gap: 6px;
    }

    .tab-btn {
      padding: 6px 14px;
      border-radius: 6px;
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

    .view-content {
      flex: 1;
      overflow: auto;
      padding: 20px;
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
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      text-align: left;
    }

    th {
      background: rgba(14, 20, 32, 0.95);
      color: #cbd5e1;
      font-weight: 700;
      padding: 10px 14px;
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 10;
      white-space: nowrap;
      font-family: var(--mono);
      font-size: 0.75rem;
    }

    td {
      padding: 9px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text-main);
      white-space: nowrap;
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-family: var(--mono);
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
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
      height: 120px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 14px;
      color: #38bdf8;
      font-family: var(--mono);
      font-size: 0.88rem;
      outline: none;
      resize: vertical;
    }

    .sql-input:focus {
      border-color: var(--emerald);
    }

    .snippets-bar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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
      background: rgba(255, 255, 255, 0.08);
      color: white;
    }

    /* Pagination */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid var(--card-border);
      background: rgba(14, 20, 32, 0.9);
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

    /* Auth Modal Overlay */
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

    .login-box {
      background: rgba(18, 26, 43, 0.95);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 36px 32px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.6);
      text-align: center;
    }

    .login-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      color: white;
      font-size: 0.9rem;
      margin-bottom: 14px;
      outline: none;
      font-family: inherit;
    }

    .login-input:focus {
      border-color: var(--emerald);
    }
  </style>
</head>
<body>

  <header>
    <a href="/" class="brand">
      <div class="brand-icon">🗄️</div>
      <div class="brand-text">
        <h1>EverGreen Studio <span class="badge badge-emerald">SQLite 3</span></h1>
        <p>packages/database/prisma/dev.db</p>
      </div>
    </a>

    <div class="header-links">
      <div id="auth-status-container" class="auth-badge">
        <span id="auth-indicator" style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#94a3b8;"></span>
        <span id="auth-user-label" style="font-weight:600;">Authenticating...</span>
        <span id="auth-role-badge" class="badge" style="display:none;"></span>
      </div>

      <a href="http://localhost:4000" target="_blank" class="btn btn-ghost">🌐 Web App (4000)</a>
      <a href="http://localhost:4301/health" target="_blank" class="btn btn-ghost">🌱 API Health (4301)</a>
      <a href="http://localhost:4301/api/docs" target="_blank" class="btn btn-ghost">📑 Swagger Docs</a>
      <button class="btn btn-ghost" id="logout-btn" onclick="handleLogout()" style="display:none; color:#fb7185;">🚪 Sign Out</button>
      <button class="btn btn-primary" onclick="loadTables()">↻ Refresh DB</button>
    </div>
  </header>

  <div class="studio-container">
    <!-- Left Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <input type="text" id="table-search" class="search-input" placeholder="🔍 Search tables (Ctrl+K)..." oninput="filterTables()">
      </div>
      <div class="table-list" id="table-list-container">
        <!-- Tables injected here -->
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

        <div style="font-size: 0.8rem; color: var(--text-sub); display: flex; align-items: center; gap: 8px;">
          <span id="active-table-title" style="font-weight: 700; color: white;">User</span>
          <span id="active-table-count" class="count-badge">0 rows</span>
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
            <span style="font-size: 0.72rem; color: var(--text-sub); display: flex; align-items: center;">Quick Queries:</span>
            <button class="snippet-btn" onclick="setQuery('SELECT * FROM User LIMIT 10;')">SELECT * FROM User</button>
            <button class="snippet-btn" onclick="setQuery('SELECT * FROM InwardBatch ORDER BY id DESC LIMIT 10;')">Recent InwardBatches</button>
            <button class="snippet-btn" onclick="setQuery('SELECT * FROM CatalogueItem;')">Catalogue Items</button>
            <button class="snippet-btn" onclick="setQuery('SELECT * FROM Session ORDER BY id DESC LIMIT 10;')">Active Sessions</button>
          </div>
          <textarea id="sql-query-input" class="sql-input" placeholder="Enter SQL query (e.g. SELECT * FROM User;)...">SELECT * FROM User LIMIT 20;</textarea>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <button class="btn btn-primary" onclick="executeCustomSql()">▶ Run Query</button>
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

  <!-- Shared Auth Login Modal -->
  <div id="login-modal" class="modal-overlay" style="display: none;">
    <div class="login-box">
      <div style="font-size: 32px; margin-bottom: 12px;">🗄️</div>
      <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 6px;">EverGreen Studio Access</h2>
      <p style="font-size: 0.8rem; color: var(--text-sub); margin-bottom: 20px;">Shared application authentication required to inspect database tables.</p>
      
      <div id="login-error" style="display: none; background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); padding: 8px 12px; border-radius: 8px; font-size: 0.8rem; margin-bottom: 14px;"></div>

      <input type="text" id="login-username" class="login-input" placeholder="Username (e.g. author or admin)" autofocus>
      <input type="password" id="login-password" class="login-input" placeholder="Password" onkeydown="if(event.key==='Enter') executeLogin()">
      
      <div style="display: flex; gap: 10px; margin-top: 8px;">
        <button class="btn btn-primary" style="flex: 1; justify-content: center; padding: 10px;" onclick="executeLogin()">Sign In to Studio</button>
      </div>
      <div style="margin-top: 16px;">
        <a href="http://localhost:4000" target="_blank" style="font-size: 0.75rem; color: #38bdf8; text-decoration: none;">← Return to Web App (4000)</a>
      </div>
    </div>
  </div>

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

    let allTables = [];
    let currentTable = '${initialTable}' || 'User';
    let currentPage = 1;
    let limit = 25;
    let totalRows = 0;
    let activeTab = 'data';
    let currentUser = null;

    function getStoredToken() {
      // 1. Check URL param ?token=...
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      if (urlToken) {
        localStorage.setItem('evergreen_studio_token', urlToken);
        // Clean URL to prevent leaking token in address bar/history
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
      roleBadge.className = 'badge ' + (user.role === 'ADMIN' ? 'badge-emerald' : '');
      document.getElementById('logout-btn').style.display = 'inline-flex';
    }

    function setUnauthenticatedUI() {
      document.getElementById('auth-indicator').style.background = '#f43f5e';
      document.getElementById('auth-user-label').innerText = 'Unauthenticated';
      document.getElementById('auth-role-badge').style.display = 'none';
      document.getElementById('logout-btn').style.display = 'none';
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
    }

    async function loadTables() {
      const authed = await checkAuth();
      if (!authed) return;

      try {
        const res = await fetch('/api/tables', {
          headers: getAuthHeaders(),
          cache: 'no-store'
        });
        if (res.status === 401) {
          checkAuth();
          return;
        }
        allTables = await res.json();
        renderTableList(allTables);
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

    function renderTableList(tables) {
      const container = document.getElementById('table-list-container');
      container.innerHTML = tables.map(t => 
        '<div class="table-item ' + (t.name === currentTable ? 'active' : '') + '" onclick="selectTable(\\'' + t.name + '\\')">' +
          '<span>' + t.name + '</span>' +
          '<span class="count-badge">' + t.count + '</span>' +
        '</div>'
      ).join('');
    }

    function filterTables() {
      const q = document.getElementById('table-search').value.toLowerCase();
      const filtered = allTables.filter(t => t.name.toLowerCase().includes(q));
      renderTableList(filtered);
    }

    function selectTable(tableName) {
      currentTable = tableName;
      currentPage = 1;
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
        const res = await fetch('/api/table/' + currentTable + '?page=' + currentPage + '&limit=' + limit, {
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
        document.getElementById('active-table-count').innerText = totalRows + ' rows';
        renderDataGrid(data.columns, data.rows);
        renderSchemaView(data.columns);
        updatePagination(data.totalRows);
      } catch (err) {
        console.error('Failed to fetch table data:', err);
      }
    }

    function renderDataGrid(columns, rows) {
      const thead = document.getElementById('data-thead');
      const tbody = document.getElementById('data-tbody');

      thead.innerHTML = '<tr>' + columns.map(c => '<th>' + (c.pk ? '🔑 ' : '') + c.name + ' <span style="opacity:0.5; font-size:0.65rem;">(' + c.type + ')</span></th>').join('') + '</tr>';

      if (!rows || rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="' + columns.length + '" style="text-align:center; padding: 32px; color: #94a3b8;">No records found in table ' + currentTable + '.</td></tr>';
        return;
      }

      tbody.innerHTML = rows.map(r => {
        return '<tr>' + columns.map(c => {
          let val = r[c.name];
          if (val === null || val === undefined) return '<td style="color:#64748b;">NULL</td>';
          if (typeof val === 'boolean') return '<td>' + (val ? '🟢 true' : '⚪ false') + '</td>';
          if (typeof val === 'object') return '<td>' + JSON.stringify(val) + '</td>';
          return '<td>' + escapeHtml(String(val)) + '</td>';
        }).join('') + '</tr>';
      }).join('');
    }

    function renderSchemaView(columns) {
      const tbody = document.getElementById('schema-tbody');
      tbody.innerHTML = columns.map(c => 
        '<tr>' +
          '<td>' + c.cid + '</td>' +
          '<td style="font-weight:700; color:white;">' + c.name + '</td>' +
          '<td><span class="badge badge-emerald">' + c.type + '</span></td>' +
          '<td>' + (c.pk ? '🔑 PRIMARY KEY' : '—') + '</td>' +
          '<td>' + (c.notnull ? 'YES' : 'NO') + '</td>' +
          '<td>' + (c.dflt_value ?? 'NULL') + '</td>' +
        '</tr>'
      ).join('');
    }

    function updatePagination(total) {
      const start = (currentPage - 1) * limit + 1;
      const end = Math.min(currentPage * limit, total);
      document.getElementById('pagination-info').innerText = total > 0 ? 'Showing ' + start + '–' + end + ' of ' + total : '0 records';
      document.getElementById('page-num-label').innerText = 'Page ' + currentPage;
      document.getElementById('prev-page-btn').disabled = currentPage <= 1;
      document.getElementById('next-page-btn').disabled = end >= total;
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
          return;
        }

        if (!data.rows || data.rows.length === 0) {
          thead.innerHTML = '';
          tbody.innerHTML = '<tr><td style="color:#94a3b8; padding: 16px;">Query executed successfully. 0 rows returned.</td></tr>';
          return;
        }

        const cols = Object.keys(data.rows[0]);
        thead.innerHTML = '<tr>' + cols.map(c => '<th>' + escapeHtml(c) + '</th>').join('') + '</tr>';
        tbody.innerHTML = data.rows.map(r => 
          '<tr>' + cols.map(c => '<td>' + (r[c] === null ? 'NULL' : escapeHtml(String(r[c]))) + '</td>').join('') + '</tr>'
        ).join('');
      } catch (err) {
        console.error('SQL query failed:', err);
      }
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('table-search')?.focus();
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

      const [columns, totalRowsRes, rows] = await Promise.all([
        prisma.$queryRawUnsafe('PRAGMA table_info("' + tableName + '");'),
        prisma.$queryRawUnsafe('SELECT COUNT(*) as cnt FROM "' + tableName + '";'),
        prisma.$queryRawUnsafe('SELECT * FROM "' + tableName + '" LIMIT ' + limit + ' OFFSET ' + offset + ';'),
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
