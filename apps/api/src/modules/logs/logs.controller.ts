import { Controller, Get } from '@nestjs/common';

@Controller('logs')
export class LogsController {
    @Get()
    getLogs() {
        // Mock CRUD logs - In production, this would query a logs database table
        return [
            {
                id: '1',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                user: 'admin',
                action: 'CREATE',
                module: 'Production',
                details: 'Created production batch #PB-2024-001'
            },
            {
                id: '2',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                user: 'admin',
                action: 'UPDATE',
                module: 'Costing',
                details: 'Updated EB cost entry for 2024-02-07'
            },
            {
                id: '3',
                timestamp: new Date(Date.now() - 10800000).toISOString(),
                user: 'admin',
                action: 'CREATE',
                module: 'Inventory',
                details: 'Added inward entry: 500kg Cotton'
            },
            {
                id: '4',
                timestamp: new Date(Date.now() - 14400000).toISOString(),
                user: 'admin',
                action: 'DELETE',
                module: 'Costing',
                details: 'Deleted expense entry #EXP-001'
            },
            {
                id: '5',
                timestamp: new Date(Date.now() - 18000000).toISOString(),
                user: 'admin',
                action: 'UPDATE',
                module: 'Settings',
                details: 'Updated EB rate to ₹10/unit'
            },
            {
                id: '6',
                timestamp: new Date(Date.now() - 21600000).toISOString(),
                user: 'admin',
                action: 'CREATE',
                module: 'Billing',
                details: 'Generated invoice #INV-2024-001'
            },
        ];
    }
}
