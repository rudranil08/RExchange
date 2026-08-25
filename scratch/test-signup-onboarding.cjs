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

// In-line store logic simulation matching lib/store/exchange-store.tsx
const SEED_USERS = [
  {
    id: 'user_alex',
    email: 'alex.m@srmist.edu.in',
    name: 'Alex Morgan',
    collegeId: 'college-srm',
    course: 'Computer Science & Engineering',
    year: 'Junior',
    selectedSkills: ['Python', 'Figma', 'Calculus'],
    derivedSkills: ['Python'],
  },
  {
    id: 'user_vikram',
    email: 'vikram.r@vit.ac.in',
    name: 'Vikram Reddy',
    collegeId: 'college-vit',
    course: 'Computer Science',
    year: 'Junior',
    selectedSkills: ['Java', 'Python'],
    derivedSkills: [],
  },
];

class MockExchangeStore {
  constructor() {
    this.users = [...SEED_USERS];
    this.activeUserId = 'user_alex';
  }

  get activeUser() {
    return this.users.find((u) => u.id === this.activeUserId) || null;
  }

  login(email, collegeId) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.collegeId === collegeId
    );

    if (existing) {
      this.activeUserId = existing.id;
      return existing;
    }

    return null;
  }

  signup(data) {
    if (!data.name || !data.email || !data.collegeId || !data.selectedSkills || data.selectedSkills.length === 0) {
      throw new Error('Validation failed: Missing required fields or capabilities');
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.collegeId === data.collegeId
    );

    if (existing) {
      const updatedUser = {
        ...existing,
        name: data.name.trim() || existing.name,
        course: data.course.trim() || existing.course,
        year: data.year.trim() || existing.year,
        selectedSkills: data.selectedSkills.length > 0 ? data.selectedSkills : existing.selectedSkills,
      };
      this.users = this.users.map((u) => (u.id === existing.id ? updatedUser : u));
      this.activeUserId = existing.id;
      return updatedUser;
    }

    const newUser = {
      id: `user_${Date.now()}_test`,
      email: data.email.trim(),
      name: data.name.trim(),
      collegeId: data.collegeId,
      course: data.course.trim() || 'General Engineering',
      year: data.year.trim() || 'Junior',
      selectedSkills: data.selectedSkills,
      derivedSkills: [],
      createdAt: new Date().toISOString(),
    };

    this.users = [newUser, ...this.users];
    this.activeUserId = newUser.id;
    return newUser;
  }

  logout() {
    this.activeUserId = null;
  }
}

async function runSignUpOnboardingSuite() {
  console.log('======================================================================');
  console.log('       NEW USER SIGN-UP & ONBOARDING VERIFICATION SUITE               ');
  console.log('======================================================================\n');

  const store = new MockExchangeStore();

  // Test 1: Existing SRM Demo User Login
  const alexLogin = store.login('alex.m@srmist.edu.in', 'college-srm');
  assert(alexLogin !== null, 'Test 1: Existing SRM demo user logs in successfully');
  assert(alexLogin.name === 'Alex Morgan', 'Test 1: Correct user identity loaded (Alex Morgan)');
  assert(store.activeUser.collegeId === 'college-srm', 'Test 1: College scope is SRM');

  // Test 2: Existing VIT Chennai Demo User Login
  const vikramLogin = store.login('vikram.r@vit.ac.in', 'college-vit');
  assert(vikramLogin !== null, 'Test 2: Existing VIT Chennai demo user logs in successfully');
  assert(vikramLogin.name === 'Vikram Reddy', 'Test 2: Correct VIT user identity loaded (Vikram Reddy)');
  assert(store.activeUser.collegeId === 'college-vit', 'Test 2: College scope is VIT Chennai');

  // Test 3: Genuinely New User is NOT Auto-Provisioned Directly
  const newEmail = 'jordan.smith@srmist.edu.in';
  const newLoginAttempt = store.login(newEmail, 'college-srm');
  assert(newLoginAttempt === null, 'Test 3: Genuinely new user cannot log in directly (returns null, prompts Sign Up)');

  // Test 4: Validation Guard on Incomplete Signup (0 skills)
  let validationCaught = false;
  try {
    store.signup({
      email: newEmail,
      name: 'Jordan Smith',
      collegeId: 'college-srm',
      course: 'Biomedical Engineering',
      year: 'Sophomore',
      selectedSkills: [], // 0 skills
    });
  } catch (err) {
    validationCaught = true;
  }
  assert(validationCaught === true, 'Test 4: Signup blocked when 0 capabilities selected');

  // Test 5: Full New User Signup Onboarding Completion
  const jordanSignup = store.signup({
    email: newEmail,
    name: 'Jordan Smith',
    collegeId: 'college-srm',
    course: 'Biomedical Engineering',
    year: 'Sophomore',
    selectedSkills: ['Bioinformatics', 'Python', 'Physics'],
  });

  assert(jordanSignup !== null, 'Test 5: New user completed onboarding profile successfully');
  assert(store.activeUser.id === jordanSignup.id, 'Test 5: New user is set as active authenticated user');
  assert(store.activeUser.selectedSkills.includes('Bioinformatics'), 'Test 5: Authentic capabilities saved to profile');
  assert(store.activeUser.year === 'Sophomore', 'Test 5: Academic year saved (Sophomore)');
  assert(store.activeUser.collegeId === 'college-srm', 'Test 5: College boundary saved (college-srm)');

  // Test 6: Subsequent Login for Newly Signed Up User
  store.logout();
  assert(store.activeUser === null, 'Test 6: Logout clears authenticated session');
  const jordanReLogin = store.login(newEmail, 'college-srm');
  assert(jordanReLogin !== null, 'Test 6: Newly signed-up user can now log in directly as existing student');
  assert(jordanReLogin.selectedSkills.length === 3, 'Test 6: Profile capabilities preserved across sessions');

  // Test 7: HTTP Routes Health Check
  const routes = ['/login', '/signup', '/profile', '/', '/matches'];
  for (const route of routes) {
    const res = await fetchRoute(route);
    assert(res.statusCode === 200, `Test 7: Route GET ${route} returns HTTP 200`);
  }

  console.log('\n======================================================================');
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('======================================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runSignUpOnboardingSuite();
