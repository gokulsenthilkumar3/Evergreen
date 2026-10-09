const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:4000';
const JWT_SECRET = 'your-very-secure-secret-here'; // From .env

function generateToken() {
    return jwt.sign({ sub: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' });
}

async function verifyMachineAPI() {
    try {
        console.log('Verifying Machine API...');
        const token = generateToken();
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Create a Machine
        console.log('1. Creating Machine...');
        const machineRes = await axios.post(`${API_URL}/production/machines`, {
            name: `Test Machine ${Date.now()}`,
            code: `TM-${Date.now()}`,
            type: 'SPINNING',
            capacityPerHour: 100
        }, { headers });
        const machineId = machineRes.data.machine.id;
        console.log('   OK, Machine ID:', machineId);

        // 2. Log Maintenance
        console.log('2. Logging Maintenance...');
        await axios.post(`${API_URL}/production/maintenance`, {
            machineId,
            type: 'PREVENTIVE',
            date: new Date().toISOString(),
            description: 'Regular checkup',
            cost: 500
        }, { headers });
        console.log('   OK');

        // 3. Log Downtime
        console.log('3. Logging Downtime...');
        await axios.post(`${API_URL}/production/downtime`, {
            machineId,
            startTime: new Date().toISOString(),
            reason: 'Power failure'
        }, { headers });
        console.log('   OK');

        // 4. Create Spare Part
        console.log('4. Creating Spare Part...');
        await axios.post(`${API_URL}/production/spare-parts`, {
            name: `Bearing X ${Date.now()}`,
            partNumber: `BR-${Date.now()}`,
            quantityInStock: 10,
            minimumStockLevel: 2,
            costPerUnit: 50
        }, { headers });
        console.log('   OK');

        console.log('Machine Management API Verification Passed!');
    } catch (error) {
        console.error('API Verification Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received (Connection Refused?)');
        } else {
            console.error('Error setup:', error.stack);
        }
    }
}

verifyMachineAPI();
