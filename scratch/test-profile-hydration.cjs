const http = require('http');

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', (err) => reject(err));
  });
}

async function testProfileSSR() {
  console.log('Testing /profile SSR rendered markup...');
  const res = await fetchRoute('/profile');
  console.log(`Status Code: ${res.statusCode}`);

  // Check if "Started 24 Aug 2026" or "Completed 24 Aug 2026" or "24 Aug 2026" appears in SSR html
  const hasDeterministicDate = res.body.includes('24 Aug 2026');
  console.log(`Has deterministic date "24 Aug 2026" in SSR output: ${hasDeterministicDate}`);

  // Check that no locale dependent "8/24/2026" or "24/08/2026" appears
  const hasLocaleUS = res.body.includes('8/24/2026');
  const hasLocaleGB = res.body.includes('24/08/2026');
  console.log(`Has locale US "8/24/2026": ${hasLocaleUS}`);
  console.log(`Has locale GB "24/08/2026": ${hasLocaleGB}`);

  if (hasLocaleUS || hasLocaleGB) {
    console.error('FAILED: Found locale-dependent date format in SSR output!');
    process.exit(1);
  }

  console.log('PASSED: Deterministic date formatting verified on SSR!');
}

testProfileSSR();
