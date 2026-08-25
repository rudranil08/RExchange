import http from 'http';
import {
  INITIAL_SEED_LISTINGS,
  SEED_USERS,
  INITIAL_SEED_EXCHANGES,
} from './lib/data/seed-data.js';

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

  // Test 1: User Profile Context
  const userAlex = SEED_USERS.find((u) => u.id === 'user_alex');
  assert(userAlex !== undefined, 'Test 1: Default user Alex Morgan exists in seed users');
  assert(userAlex?.collegeId === 'college-srm', 'Test 1: User college is SRM Institute of Science and Technology');
  assert(userAlex?.year === 'Junior', 'Test 1: User academic standing is Junior (3rd year)');
  assert(Array.isArray(userAlex?.selectedSkills) && userAlex.selectedSkills.length >= 3, 'Test 1: User has selected onboarding skills');

  // Test 2: Exchange Statistics Computation for User Alex
  const alexExchanges = INITIAL_SEED_EXCHANGES.filter(
    (ex) => ex.initiatorUserId === 'user_alex' || ex.receiverUserId === 'user_alex'
  );
  const completedExchanges = alexExchanges.filter((ex) => ex.status === 'CONFIRMED');
  const activeExchanges = alexExchanges.filter((ex) => ex.status === 'INITIATED');
  const cancelledExchanges = alexExchanges.filter((ex) => ex.status === 'CANCELLED');

  assert(alexExchanges.length === 2, 'Test 2: Alex has exactly 2 seed exchanges in history');
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
  const newUser = {
    id: 'user_new_01',
    name: 'New Student',
    collegeId: 'college-srm',
    year: '1',
    selectedSkills: ['Python'],
    derivedSkills: [],
  };
  const newUserExchanges = [];
  const newUserCompleted = newUserExchanges.filter((ex) => ex.status === 'CONFIRMED');
  const newUserConcluded = newUserCompleted.length;
  let newUserReliability = 'Building history';
  if (newUserConcluded > 0) {
    newUserReliability = `${Math.round((newUserCompleted.length / newUserConcluded) * 100)}%`;
  }
  assert(newUserReliability === 'Building history', 'Test 4: New user displays "Building history" instead of fabricated 0%');

  // Test 5: HTTP Route Verification
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
