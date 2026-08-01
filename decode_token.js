const axios = require('axios');
(async () => {
    const loginRes = await axios.post('http://localhost:3001/auth/login', { username: 'gokultest', password: 'password123' });
    const token = loginRes.data.access_token;
    const base64Url = token.split('.')[1];
    console.log(Buffer.from(base64Url, 'base64').toString());
})();
