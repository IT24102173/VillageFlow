const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('https://villageflow.onrender.com/api/welfare/all');
        console.log('Welfare all result count:', res.data.length);
    } catch (err) {
        console.error('Welfare all error:', err.response ? err.response.status : err.message);
    }
}

test();
