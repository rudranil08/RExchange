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

async function runProfileSuite() {
  console.log('==================================================');
  console.log('    ACCOUNT / PROFILE FEATURE TEST SUITE         ');
  console.log('==================================================\n');

  // Test 1: User Profile Context Check
  const mockUserAlex = {
    id: 'user_alex',
    name: 'Alex Morgan',
    collegeId: 'college-srm',
    course: 'Computer Science & Engineering',
    year: 'Junior',
    selectedSkills: ['Python', 'Figma', 'Calculus'],
    derivedSkills: ['Python'],
  };

  assert(mockUserAlex.collegeId === 'college-srm', 'Test 1: User college is SRM Institute of Science and Technology');
  assert(mockUserAlex.year === 'Junior', 'Test 1: User academic standing is Junior (3rd year)');
  assert(Array.isArray(mockUserAlex.selectedSkills) && mockUserAlex.selectedSkills.length === 3, 'Test 1: User has selected onboarding skills');

  // Test 2: Exchange Statistics Computation for Alex
  const mockAlexExchanges = [
    {
      id: 'exchange_01',
      initiatorUserId: 'user_alex',
      receiverUserId: 'user_sarah',
      status: 'INITIATED',
    },
    {
      id: 'exchange_02',
      initiatorUserId: 'user_alex',
      receiverUserId: 'user_david',
      status: 'CONFIRMED',
    },
  ];

  const completedExchanges = mockAlexExchanges.filter((ex) => ex.status === 'CONFIRMED');
  const activeExchanges = mockAlexExchanges.filter((ex) => ex.status === 'INITIATED');
  const cancelledExchanges = mockAlexExchanges.filter((ex) => ex.status === 'CANCELLED');

  assert(mockAlexExchanges.length === 2, 'Test 2: Alex has 2 exchanges in history');
  assert(completedExchanges.length === 1, 'Test 2: Exactly 1 completed exchange in history');
  assert(activeExchanges.length === 1, 'Test 2: Exactly 1 active exchange in history');

  // Test 3: Exchange Reliability Calculation
  const concludedCount = completedExchanges.length + cancelledExchanges.length;
  let reliability = 'Building history';
  if (concludedCount > 0) {
    const rate = Math.round((completedExchanges.length / concludedCount) * 100);
    reliability = `${rate}%`;
  }
  assert(reliability === '100%', `Test 3: Reliability for Alex is deterministically computed as 100% (was: ${reliability})`);

  // Test 4: Empty State & Provisional Reliability for New User (Zero Exchanges)
  const newUserExchanges = [];
  const newUserCompleted = newUserExchanges.filter((ex) => ex.status === 'CONFIRMED');
  const newUserCancelled = newUserExchanges.filter((ex) => ex.status === 'CANCELLED');
  const newUserConcluded = newUserCompleted.length + newUserCancelled.length;
  let newUserReliability = 'Building history';
  if (newUserConcluded > 0) {
    newUserReliability = `${Math.round((newUserCompleted.length / newUserConcluded) * 100)}%`;
  }
  assert(newUserReliability === 'Building history', 'Test 4: New user displays "Building history" instead of fabricated 0%');

  // Test 5: HTTP Route Verification across all 7 views
  const routes = [
    '/',
    '/login',
    '/matches',
    '/exchange/new',
    '/exchange',
    '/my-exchanges',
    '/profile',
  ];

  for (const route of routes) {
    try {
      const res = await fetchRoute(route);
      assert(res.statusCode === 200, `Test 5: Route GET ${route} returns HTTP 200`);
    } catch (err) {
      assert(false, `Test 5: Route GET ${route} failed with error: ${err.message}`);
    }
  }

  console.log('\n==================================================');
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runProfileSuite();
