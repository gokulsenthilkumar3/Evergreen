const api = require('axios');
(async () => {
  try {
    const res = await api.post('http://localhost:3001/auth/signup', {
      name: 'Gokul Test',
      username: 'gokultest',
      email: 'gokultest@example.com',
      password: 'password123'
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
})();
