const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:4000';
const SECRET = 'your-very-secure-secret-here';

async function verify() {
    try {
        console.log('Starting Warehouse Verification...');

        // 1. Generate Token
        // sub: test-user-id is used by authenticate middleware
        const token = jwt.sign({ sub: '00000000-0000-4000-8000-000000000000', role: 'ADMIN' }, SECRET, { expiresIn: '1h' });
        const headers = { Authorization: `Bearer ${token}` };

        // 1.5 Try to ensure a user exists (optional, depends on middleware)
        // Let's just try the warehouse creation first.

        // 2. Create Warehouse
        console.log('Creating Warehouse...');
        const whRes = await axios.post(`${API_URL}/inventory/warehouses`, {
            name: `Main Warehouse ${Date.now()}`,
            code: `WH-${Date.now()}`,
            type: 'GENERAL',
            address: '123 Test St'
        }, { headers });
        const warehouseId = whRes.data.warehouse.id;
        console.log('Warehouse Created:', warehouseId);

        // 3. Add Locations
        console.log('Adding Location...');
        const locRes = await axios.post(`${API_URL}/inventory/warehouses/${warehouseId}/locations`, {
            code: 'Z1-R1-B1',
            zone: 'Zone 1',
            rack: 'Rack 1',
            bin: 'Bin 1',
            capacity: 1000
        }, { headers });
        const locationId = locRes.data.location.id;
        console.log('Location Added:', locationId);

        // 4. List Warehouses
        console.log('Listing Warehouses...');
        const listRes = await axios.get(`${API_URL}/inventory/warehouses`, { headers });
        if (listRes.data.warehouses.length > 0) {
            console.log('Warehouses listed successfully');
        } else {
            console.error('No warehouses found');
        }

        console.log('Verification Complete!');
    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verify();
