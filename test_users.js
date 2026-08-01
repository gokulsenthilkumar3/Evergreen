const axios = require('axios');
(async () => {
    try {
        await axios.post('http://localhost:3001/users', { username: 'test1', password: '123' });
    } catch (e) {
        console.log(e.response.status);
        console.log(e.response.data);
    }
})();
