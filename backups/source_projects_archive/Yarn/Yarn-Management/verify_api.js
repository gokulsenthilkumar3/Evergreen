const axios = require('axios');

async function verify() {
    try {
        console.log('Testing GET /production/work-orders...');
        // We need a way to authenticate. For now, let's see if we get 401 (good) or 500 (bad).
        // If we get 401, it means the server is running and route exists.
        // If we get 500, it's broken.
        // To truly test 200, we'd need a token.

        try {
            await axios.get('http://localhost:4000/production/work-orders');
        } catch (e) {
            if (e.response) {
                console.log(`Status: ${e.response.status}`);
                if (e.response.status === 401) {
                    console.log('Success: Got 401 Unauthorized (Route exists and is protected)');
                } else if (e.response.status === 500) {
                    console.error('Failure: Got 500 Internal Server Error');
                    console.error(e.response.data);
                } else {
                    console.log('Got other status:', e.response.status);
                }
            } else {
                console.error('Connection refused or other error', e.message);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

verify();
