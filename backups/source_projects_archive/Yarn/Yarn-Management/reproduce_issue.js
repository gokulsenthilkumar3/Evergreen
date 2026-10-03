
// using global fetch


const BASE_URL = 'http://localhost:4000';
const EMAIL = 'admin@example.com';
const PASSWORD = 'admin123456!';

async function main() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status, await loginRes.text());
            process.exit(1);
        }

        const loginData = await loginRes.json();
        const token = loginData.accessToken;
        console.log('Login successful. Token:', token.substring(0, 20) + '...');

        console.log('\n2. Attempting to add supplier (Legacy/Frontend Payload)...');
        const supplierPayload = {
            name: 'Test Supplier',
            email: 'test@example.com',
            phone: '1234567890',
            address: '123 Test St',
            paymentTerms: 'NET 30',
            rating: 5,
            notes: 'Test notes'
        };

        const supplierRes = await fetch(`${BASE_URL}/suppliers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(supplierPayload)
        });

        console.log('Response Status:', supplierRes.status);
        const text = await supplierRes.text();
        console.log('Response Body:', text);

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
