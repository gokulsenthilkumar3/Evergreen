import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../..');

const pgSqlPath = path.join(root, 'packages/database/prisma/postgres/migrations/20261104000000_initial/migration.sql');
const outDir = path.join(root, 'packages/database/sqlserver');
fs.mkdirSync(outDir, { recursive: true });
const outSqlPath = path.join(outDir, 'evergreen_ssms_schema.sql');

const pgSql = fs.readFileSync(pgSqlPath, 'utf8');

// Identify columns that are used in PK, UK, FK, or INDEX so they get NVARCHAR(255) instead of NVARCHAR(MAX)
const indexedCols = new Set([
  'id', 'requestKey', 'scopeKey', 'hash', 'publicId', 'email', 'username', 'code',
  'batchNumber', 'lotNumber', 'orderNumber', 'invoiceNumber', 'ticketId', 'resourceId',
  'userId', 'customerId', 'supplierId', 'itemId', 'locationId', 'machineId', 'status',
  'category', 'priority', 'queue', 'visibility', 'kind', 'createdBy', 'actorUsername',
  'phoneNumber', 'gstin', 'pan', 'sku', 'name', 'providerKey', 'sessionToken', 'parentId',
  'mergedIntoId', 'wipLotNumber', 'challanNumber', 'barcode'
]);

// Find all foreign key and index targets from the SQL
const fkRegex = /REFERENCES\s+"(\w+)"\("(\w+)"\)/gi;
let match;
while ((match = fkRegex.exec(pgSql)) !== null) {
  indexedCols.add(match[2]);
}

const lines = pgSql.split(/\r?\n/);
const tsqlLines = [];

tsqlLines.push('-- =================================================================');
tsqlLines.push('--  EverGreen Enterprise Textile ERP - SQL Server (SSMS) Schema');
tsqlLines.push('--  Engineered for Microsoft SQL Server 2017+ / Azure SQL / SSMS');
tsqlLines.push('-- =================================================================');
tsqlLines.push('');
tsqlLines.push('IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N\'EverGreen\')');
tsqlLines.push('BEGIN');
tsqlLines.push('    CREATE DATABASE [EverGreen];');
tsqlLines.push('END;');
tsqlLines.push('GO');
tsqlLines.push('');
tsqlLines.push('USE [EverGreen];');
tsqlLines.push('GO');
tsqlLines.push('');
tsqlLines.push('SET ANSI_NULLS ON;');
tsqlLines.push('GO');
tsqlLines.push('SET QUOTED_IDENTIFIER ON;');
tsqlLines.push('GO');
tsqlLines.push('');

for (let line of lines) {
  let trimmed = line.trim();

  // Replace Postgres SERIAL
  if (/"id"\s+SERIAL\s+NOT\s+NULL/i.test(line)) {
    line = line.replace(/"id"\s+SERIAL\s+NOT\s+NULL/i, '[id] INT IDENTITY(1,1) NOT NULL');
  }

  // Replace quotes with brackets
  line = line.replace(/"(\w+)"/g, '[$1]');

  // Replace datatypes
  line = line.replace(/\bTIMESTAMP\(3\)/gi, 'DATETIME2(3)');
  line = line.replace(/\bCURRENT_TIMESTAMP\b/gi, 'SYSUTCDATETIME()');
  line = line.replace(/\bBOOLEAN\b/gi, 'BIT');
  line = line.replace(/\bDEFAULT\s+false\b/gi, 'DEFAULT 0');
  line = line.replace(/\bDEFAULT\s+true\b/gi, 'DEFAULT 1');
  line = line.replace(/\bDOUBLE PRECISION\b/gi, 'FLOAT');
  line = line.replace(/\bINTEGER\b/gi, 'INT');

  // Replace TEXT columns intelligently
  // If column name is in indexedCols or ends with Id/Key/Code/Number/Status/Type -> NVARCHAR(255)
  // Else NVARCHAR(MAX)
  const textColMatch = line.match(/^\s*\[(\w+)\]\s+TEXT(\s+.*)?$/i);
  if (textColMatch) {
    const colName = textColMatch[1];
    const rest = textColMatch[2] || '';
    const isIndexed = indexedCols.has(colName) || 
                      /Id$|Key$|Code$|Number$|Status$|Type$|Name$|Hash$/i.test(colName) ||
                      /PRIMARY KEY|UNIQUE/i.test(rest);
    const targetType = isIndexed ? 'NVARCHAR(255)' : 'NVARCHAR(MAX)';
    line = line.replace(/\bTEXT\b/i, targetType);
  }

  // Replace any remaining TEXT keywords with NVARCHAR(MAX)
  line = line.replace(/\bTEXT\b/gi, 'NVARCHAR(MAX)');
  line = line.replace(/ON DELETE RESTRICT/gi, 'ON DELETE NO ACTION');
  line = line.replace(/ON UPDATE CASCADE/gi, 'ON UPDATE NO ACTION');

  // Add GO after CREATE TABLE closing
  if (/^\);\s*$/.test(line)) {
    tsqlLines.push(line);
    tsqlLines.push('GO');
    tsqlLines.push('');
    continue;
  }

  // Add GO after CREATE INDEX
  if (/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i.test(trimmed)) {
    line = line.replace(/^CREATE\s+(UNIQUE\s+)?INDEX\s+/i, (m, u) => u ? 'CREATE UNIQUE NONCLUSTERED INDEX ' : 'CREATE NONCLUSTERED INDEX ');
    tsqlLines.push(line);
    tsqlLines.push('GO');
    tsqlLines.push('');
    continue;
  }

  // Add GO after ALTER TABLE
  if (/^ALTER\s+TABLE\s+/i.test(trimmed)) {
    tsqlLines.push(line);
    tsqlLines.push('GO');
    tsqlLines.push('');
    continue;
  }

  tsqlLines.push(line);
}

fs.writeFileSync(outSqlPath, tsqlLines.join('\n'), 'utf8');
console.log(`Generated SSMS SQL schema at: ${outSqlPath} (${tsqlLines.length} lines)`);
