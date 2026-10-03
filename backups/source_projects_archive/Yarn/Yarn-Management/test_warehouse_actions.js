const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:4000';
const JWT_SECRET = 'your-very-secure-secret-here'; // From .env

const token = jwt.sign({ id: 'test-user-id', email: 'admin@example.com', role: 'ADMIN' }, JWT_SECRET);

async function runTests() {
    try {
        console.log('1. Testing GET /inventory/warehouses...');
        const whRes = await axios.get(`${API_URL}/inventory/warehouses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', whRes.data.warehouses.length, 'warehouses found');

        console.log('2. Testing GET /inventory/analysis/aging...');
        const agingRes = await axios.get(`${API_URL}/inventory/analysis/aging`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', agingRes.data.aging);

        console.log('3. Testing GET /inventory/qrcode...');
        const qrRes = await axios.get(`${API_URL}/inventory/qrcode?text=test`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success: QR URL prefix:', qrRes.data.dataUrl.substring(0, 30));

        console.log('All backend actions for Warehouse Management seem functional.');
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
}

runTests();
