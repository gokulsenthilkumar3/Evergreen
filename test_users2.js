const axios = require('axios');
(async () => {
    try {
        const loginRes = await axios.post('http://localhost:3001/auth/login', { username: 'gokultest', password: 'password123' });
        const token = loginRes.data.access_token;
        console.log("Token:", token.substring(0, 20) + "...");
        
        const res = await axios.get('http://localhost:3001/sessions', 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);
    } catch (e) {
        console.log(e.response.status);
        console.log(e.response.data);
    }
})();
