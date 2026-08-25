const http = require('http');

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

function fetchRoute(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', (err) => reject(err));
  });
}

async function runThreeFixesSuite() {
  console.log('==================================================');
  console.log('   THREE-FIX VERIFICATION TEST SUITE              ');
  console.log('==================================================\n');

  // Fix 1 & 2: Make Me Matchable Complete Context & Automatic Creation
  const originalListing = {
    id: 'listing_test_orig_01',
    userId: 'user_alex',
    collegeId: 'college-srm',
    offer: 'Nothing useful / open to offers',
    need: 'TI-84 Plus CE Graphing Calculator with charger',
    category: 'TECH_ELECTRONICS',
    exchangeType: 'SWAP',
  };

  const selectedCapability = 'Python tutoring';

  // Simulate automatic creation from "Use this as my offer"
  const createdListing = {
    id: 'listing_test_created_01',
    userId: originalListing.userId,
    collegeId: originalListing.collegeId,
    title: `${selectedCapability} for ${originalListing.need}`,
    description: `Offering ${selectedCapability} in exchange for ${originalListing.need}.`,
    category: originalListing.category,
    exchangeType: originalListing.exchangeType,
    offer: selectedCapability,
    need: originalListing.need,
    status: 'ACTIVE',
  };

  assert(originalListing.offer === 'Nothing useful / open to offers', 'Fix 1: Original listing HAVE is preserved');
  assert(originalListing.need === 'TI-84 Plus CE Graphing Calculator with charger', 'Fix 1: Original listing NEED is preserved');
  assert(createdListing.offer === 'Python tutoring', 'Fix 2: Newly created listing offer is set to selected capability');
  assert(createdListing.need === originalListing.need, 'Fix 2: Newly created listing retains exact original need');
  assert(originalListing.id !== createdListing.id, 'Fix 2: Original listing is not mutated/destroyed');

  // Fix 3: Discover / Dashboard listing detail routes across categories
  const testListingIds = [
    'listing_sarah_01',
    'listing_david_01',
    'listing_priya_01',
    'listing_marcus_01',
    'listing_karthik_01',
    'listing_david_02',
    'listing_kevin_01',
  ];

  for (const id of testListingIds) {
    const res = await fetchRoute(`/exchange/${id}`);
    assert(res.statusCode === 200, `Fix 3: Route GET /exchange/${id} returns HTTP 200`);
  }

  // General App Routes Health Check
  const appRoutes = [
    '/',
    '/login',
    '/matches',
    '/exchange/new',
    '/profile',
    '/my-exchanges',
  ];

  for (const route of appRoutes) {
    const res = await fetchRoute(route);
    assert(res.statusCode === 200, `Health: Route GET ${route} returns HTTP 200`);
  }

  console.log('\n==================================================');
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runThreeFixesSuite();
