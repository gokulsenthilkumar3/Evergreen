import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../../prisma/client';
import { IMPORT_COLUMNS, type ImportKind } from './import.columns';
import { RawMaterialStatus } from '@prisma/client';

type Row = Record<string, unknown>;
type RowError = { row: number; message: string };

function value(row: Row, column: string): string {
    return String(row[column] ?? '').trim();
}

function readRows(req: Request, res: Response, kind: ImportKind): Row[] | null {
    if (!req.file) {
        res.status(400).json({ message: 'Choose a CSV or Excel file (maximum 2 MB)' });
        return null;
    }
    try {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error('No worksheet found');
        const headerRow = (XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][])[0] || [];
        const headers = headerRow.map((cell) => String(cell ?? '').trim());
        const required = IMPORT_COLUMNS[kind].filter((column) => column.required).map((column) => column.name);
        const missing = required.filter((column) => !headers.includes(column));
        if (missing.length) {
            res.status(422).json({ message: `Missing required columns: ${missing.join(', ')}`, columns: IMPORT_COLUMNS[kind] });
            return null;
        }
        const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: '', raw: false });
        if (!rows.length || rows.length > 1000) {
            res.status(422).json({ message: 'Include between 1 and 1000 data rows. The template contains headers only.' });
            return null;
        }
        return rows;
    } catch {
        res.status(400).json({ message: 'Could not read this CSV or Excel file' });
        return null;
    }
}

function invalidNumber(input: string) {
    return input !== '' && (!Number.isFinite(Number(input)) || Number(input) < 0);
}

export const handleSupplierImport = async (req: Request, res: Response) => {
    try {
        const data = readRows(req, res, 'suppliers');
        if (!data) return;
        const errors: RowError[] = [];
        data.forEach((row, index) => {
            if (!value(row, 'Name')) errors.push({ row: index + 2, message: 'Name is required' });
            const rating = value(row, 'Rating');
            if (invalidNumber(rating) || (rating && Number(rating) > 5)) errors.push({ row: index + 2, message: 'Rating must be between 0 and 5' });
            const email = value(row, 'Email');
            if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push({ row: index + 2, message: 'Email is invalid' });
        });
        if (errors.length) return res.status(422).json({ message: 'Import has invalid rows; no records were created', errors });

        // Basic mapping based on template
        // Name,Email,Phone,Address,GSTIN,Payment Terms,Rating,Notes,Status
        await prisma.$transaction(async (tx) => {
          for (const [index, row] of data.entries()) {
            await tx.supplier.create({
                data: {
                    name: value(row, 'Name'),
                    email: value(row, 'Email') || undefined,
                    phone: value(row, 'Phone') || undefined,
                    address: value(row, 'Address') || undefined,
                    gstin: value(row, 'GSTIN') || undefined,
                    paymentTerms: value(row, 'Payment Terms') || undefined,
                    rating: value(row, 'Rating') ? Number(value(row, 'Rating')) : undefined,
                    notes: value(row, 'Notes') || undefined,
                    status: value(row, 'Status') || 'Active',
                    businessType: value(row, 'Business Type') || 'Manufacturer',
                    supplierCode: value(row, 'Supplier Code') || `SUP-${Date.now()}-${index}`,
                    supplierType: value(row, 'Supplier Type') || 'Regular'
                }
            });
          }
        });

        res.json({ message: `Successfully imported ${data.length} suppliers`, imported: data.length });
    } catch (error: any) {
        console.error('Import error:', error);
        res.status(409).json({ message: 'Import could not be completed; no records were created. Check for duplicate supplier codes or invalid values.' });
    }
};

export const handleRawMaterialImport = async (req: Request, res: Response) => {
    try {
        const data = readRows(req, res, 'raw-materials');
        if (!data) return;
        const supplierNames = [...new Set(data.map((row) => value(row, 'Supplier Name')).filter(Boolean))];
        const suppliers = await prisma.supplier.findMany({ where: { name: { in: supplierNames } }, select: { id: true, name: true } });
        const supplierIds = new Map(suppliers.map((supplier) => [supplier.name, supplier.id]));
        const errors: RowError[] = [];
        data.forEach((row, index) => {
            if (!value(row, 'Batch No')) errors.push({ row: index + 2, message: 'Batch No is required' });
            if (!value(row, 'Type')) errors.push({ row: index + 2, message: 'Type is required' });
            if (!supplierIds.has(value(row, 'Supplier Name'))) errors.push({ row: index + 2, message: 'Supplier Name must match an existing supplier' });
            for (const column of ['Quantity', 'Cost', 'Quality Score', 'Moisture']) {
                const cell = value(row, column);
                if (['Quantity', 'Cost', 'Quality Score'].includes(column) && !cell) errors.push({ row: index + 2, message: `${column} is required` });
                else if (invalidNumber(cell)) errors.push({ row: index + 2, message: `${column} must be a non-negative number` });
                else if (column === 'Quantity' && cell && Number(cell) === 0) errors.push({ row: index + 2, message: 'Quantity must be positive' });
                else if (column === 'Quality Score' && cell && (Number(cell) < 1 || Number(cell) > 10)) errors.push({ row: index + 2, message: 'Quality Score must be between 1 and 10' });
                else if (column === 'Moisture' && cell && Number(cell) > 100) errors.push({ row: index + 2, message: 'Moisture must be between 0 and 100' });
            }
            const received = value(row, 'Received Date');
            if (!received || Number.isNaN(Date.parse(received))) errors.push({ row: index + 2, message: 'Received Date must be a valid date' });
            const status = value(row, 'Status');
            if (status && !Object.values(RawMaterialStatus).includes(status as RawMaterialStatus)) errors.push({ row: index + 2, message: `Status must be one of ${Object.values(RawMaterialStatus).join(', ')}` });
        });
        if (errors.length) return res.status(422).json({ message: 'Import has invalid rows; no records were created', errors });

        // Batch No,Supplier Name,Type,Quantity,Unit,Quality Score,Received Date,Cost,Moisture,Location,Status,Notes
        await prisma.$transaction(async (tx) => {
          for (const row of data) {
            await tx.rawMaterial.create({
                data: {
                    batchNo: value(row, 'Batch No'),
                    supplierId: supplierIds.get(value(row, 'Supplier Name'))!,
                    materialType: value(row, 'Type'),
                    quantity: value(row, 'Quantity'),
                    unit: value(row, 'Unit') || 'kg',
                    qualityScore: value(row, 'Quality Score'),
                    receivedDate: new Date(value(row, 'Received Date')),
                    costPerUnit: value(row, 'Cost'),
                    totalCost: String(Number(value(row, 'Quantity')) * Number(value(row, 'Cost'))),
                    moistureContent: value(row, 'Moisture') || '0',
                    legacyLocation: value(row, 'Location') || undefined,
                    status: (value(row, 'Status') || 'IN_STOCK') as RawMaterialStatus,
                    notes: value(row, 'Notes') || undefined
                }
            });
          }
        });

        res.json({ message: `Successfully imported ${data.length} raw materials`, imported: data.length });
    } catch (error: any) {
        console.error('Import error:', error);
        res.status(409).json({ message: 'Import could not be completed; no records were created. Check for duplicate batch numbers or invalid values.' });
    }
};
