const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('https://villageflow.onrender.com/api/certificates/all');
        console.log('Certificates all result count:', res.data.length);
    } catch (err) {
        console.error('Certificates all error:', err.response ? err.response.status : err.message);
    }
}

test();
