const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('https://villageflow.onrender.com/api/certificates/history');
        console.log('History result:', res.data);
    } catch (err) {
        console.error('History error:', err.response ? err.response.status : err.message);
    }
}

test();
