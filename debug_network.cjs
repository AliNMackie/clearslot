const https = require('https');

const urls = [
    { name: 'Local Env Backend', url: 'https://clearslot-backend-7n7gcz7ika-nw.a.run.app' },
    { name: 'Prod Env Backend', url: 'https://clearslot-backend-679965494062.europe-west2.run.app' }
];

const origins = [
    'http://localhost:5173',
    'https://clearslot.netlify.app'
];

async function checkUrl(name, baseUrl, origin) {
    return new Promise((resolve) => {
        const options = {
            method: 'GET',
            headers: {
                'Origin': origin
            }
        };

        const req = https.request(baseUrl + '/', options, (res) => {
            console.log(`\n[${name}] checking ${baseUrl}`);
            console.log(`  Status: ${res.statusCode}`);
            console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'MISSING'}`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.log(`  Response Body (first 100 chars): ${data.substring(0, 100)}`);
                }
                resolve();
            });
        });

        req.on('error', (e) => {
            console.error(`\n[${name}] ERROR: ${e.message}`);
            resolve();
        });

        req.end();
    });
}

async function run() {
    console.log("--- Network Debug Checks ---");
    for (const endpoint of urls) {
        for (const origin of origins) {
            console.log(`Testing Origin: ${origin}`);
            await checkUrl(endpoint.name, endpoint.url, origin);
        }
    }
}

run();
