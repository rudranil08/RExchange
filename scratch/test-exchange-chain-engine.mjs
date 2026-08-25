import {
  findExchangeChainsForListing,
  isOfferSatisfyingNeed,
} from './lib/matching/chain-discovery.js';
import {
  Category,
  ExchangeType,
  ListingStatus,
} from './lib/types.js';
import {
  INITIAL_SEED_LISTINGS,
  SEED_USERS,
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

console.log('==================================================');
console.log('    STEP 2 — EXCHANGE CHAIN ENGINE TEST SUITE    ');
console.log('==================================================\n');

// Setup mock test environment
const mockUsers = [
  {
    id: 'user_a',
    name: 'Alice A',
    collegeId: 'college-srm',
    course: 'Computer Science',
    year: '2',
    selectedSkills: ['Calculator'],
    derivedSkills: [],
  },
  {
    id: 'user_b',
    name: 'Bob B',
    collegeId: 'college-srm',
    course: 'Data Science',
    year: '2',
    selectedSkills: ['Python'],
    derivedSkills: [],
  },
  {
    id: 'user_c',
    name: 'Charlie C',
    collegeId: 'college-srm',
    course: 'Design',
    year: '3',
    selectedSkills: ['Figma'],
    derivedSkills: [],
  },
  {
    id: 'user_d_senior',
    name: 'Dan Senior',
    collegeId: 'college-srm',
    course: 'Robotics',
    year: '4', // Year gap with 1st year = 3
    selectedSkills: ['Hardware'],
    derivedSkills: [],
  },
  {
    id: 'user_e_freshman',
    name: 'Eve Freshman',
    collegeId: 'college-srm',
    course: 'Bio',
    year: '1',
    selectedSkills: ['Bio'],
    derivedSkills: [],
  },
  {
    id: 'user_cross_college',
    name: 'Cross College Student',
    collegeId: 'college-vit', // Different college!
    course: 'CS',
    year: '2',
    selectedSkills: ['Figma'],
    derivedSkills: [],
  },
];

// --- TEST 1: Valid 3-Person Closed Loop (A → B → C → A) ---
const listingA = {
  id: 'listing_a',
  userId: 'user_a',
  collegeId: 'college-srm',
  title: 'TI-84 Graphing Calculator for Python',
  description: 'Have TI-84, need Python tutoring',
  category: Category.TECH_ELECTRONICS,
  exchangeType: ExchangeType.SWAP,
  offer: 'TI-84 Plus Graphing Calculator with charger',
  need: 'Python programming fundamentals & CS101 tutoring',
  tags: ['calculator', 'ti-84', 'python', 'tutoring'],
  status: ListingStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const listingB = {
  id: 'listing_b',
  userId: 'user_b',
  collegeId: 'college-srm',
  title: 'Python Tutoring for Figma Design',
  description: 'Have Python tutoring, need Figma pitch deck',
  category: Category.SKILLS_SERVICES,
  exchangeType: ExchangeType.SKILL_EXCHANGE,
  offer: 'Python programming fundamentals & CS101 tutoring',
  need: 'High-impact Figma pitch deck and presentation slide design',
  tags: ['python', 'tutoring', 'figma', 'design'],
  status: ListingStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const listingC = {
  id: 'listing_c',
  userId: 'user_c',
  collegeId: 'college-srm',
  title: 'Figma Design for Calculator',
  description: 'Have Figma design, need TI-84 calculator',
  category: Category.SKILLS_SERVICES,
  exchangeType: ExchangeType.SKILL_EXCHANGE,
  offer: 'High-impact Figma pitch deck and presentation slide design',
  need: 'TI-84 Plus Graphing Calculator with charger',
  tags: ['figma', 'design', 'calculator', 'ti-84'],
  status: ListingStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const chains1 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
assert(chains1.length === 1, 'Test 1: Successfully discovered valid 3-person chain');
assert(chains1[0]?.participantUserIds.length === 3, 'Test 1: Chain has exactly 3 participants');
assert(chains1[0]?.edges.length === 3, 'Test 1: Chain has 3 directed edges');
assert(chains1[0]?.score >= 90, `Test 1: Chain score is strong (${chains1[0]?.score})`);
assert(chains1[0]?.edges[0].fromUserId === 'user_a' && chains1[0]?.edges[0].toUserId === 'user_b', 'Test 1: Edge 1 is A -> B');
assert(chains1[0]?.edges[1].fromUserId === 'user_b' && chains1[0]?.edges[1].toUserId === 'user_c', 'Test 1: Edge 2 is B -> C');
assert(chains1[0]?.edges[2].fromUserId === 'user_c' && chains1[0]?.edges[2].toUserId === 'user_a', 'Test 1: Edge 3 is C -> A (Closed Loop)');

// --- TEST 2: Incomplete Loop (A → B → C, but C does NOT satisfy A) ---
const listingC_broken = {
  id: 'listing_c_broken',
  userId: 'user_c',
  collegeId: 'college-srm',
  title: 'Figma Design for Video Editing',
  description: 'Have Figma design, need Video Editing',
  category: Category.SKILLS_SERVICES,
  exchangeType: ExchangeType.SKILL_EXCHANGE,
  offer: 'High-impact Figma pitch deck and presentation slide design',
  need: 'Professional 4K Video Editing for campus fest',
  tags: ['figma', 'video-editing'],
  status: ListingStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const chains2 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC_broken], mockUsers);
assert(chains2.length === 0, 'Test 2: Incomplete loop rejected (C does not satisfy A.need)');

// --- TEST 3 & 4: Self-Match & Duplicate Participant Prevention ---
// If user_a also creates another listing that attempts to act as B
const listingB_owned_by_A = {
  ...listingB,
  id: 'listing_b_by_a',
  userId: 'user_a', // Owned by Alice!
};

const chains3 = findExchangeChainsForListing(listingA, [listingA, listingB_owned_by_A, listingC], mockUsers);
assert(chains3.length === 0, 'Test 3 & 4: Self-match / duplicate user strictly excluded from chain');

// --- TEST 5: Cross-College Boundary Enforcement ---
const listingC_cross_college = {
  ...listingC,
  id: 'listing_c_cross',
  userId: 'user_cross_college',
  collegeId: 'college-vit', // VIT student attempting to match with SRM
};

const chains5 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC_cross_college], mockUsers);
assert(chains5.length === 0, 'Test 5: Cross-college participant strictly blocked from chain');

// --- TEST 6: Invalid Year Gap (Gap >= 3) ---
const listingA_freshman = {
  ...listingA,
  userId: 'user_e_freshman', // Year 1
};
const listingC_senior = {
  ...listingC,
  userId: 'user_d_senior', // Year 4 (Gap = 3 between Freshman and Senior)
};

const chains6 = findExchangeChainsForListing(listingA_freshman, [listingA_freshman, listingB, listingC_senior], mockUsers);
assert(chains6.length === 0, 'Test 6: Year gap >= 3 (1st year ↔ 4th year) strictly rejected');

// --- TEST 7: Valid Year Gap (Gap <= 2) ---
// Year 1 (Eve) ↔ Year 2 (Bob) ↔ Year 3 (Charlie) -> Max pairwise gap is 2
const chains7 = findExchangeChainsForListing(listingA_freshman, [listingA_freshman, listingB, listingC], mockUsers);
assert(chains7.length === 1, 'Test 7: Valid year gaps (1st ↔ 2nd ↔ 3rd) permitted in chain');

// --- TEST 8: Direct Match Regression Verification ---
// Direct reciprocal pairs must still be discoverable independently
const directMatchAtoB = isOfferSatisfyingNeed(INITIAL_SEED_LISTINGS[0].offer, INITIAL_SEED_LISTINGS[0].tags, INITIAL_SEED_LISTINGS[1].need);
const directMatchBtoA = isOfferSatisfyingNeed(INITIAL_SEED_LISTINGS[1].offer, INITIAL_SEED_LISTINGS[1].tags, INITIAL_SEED_LISTINGS[0].need);
assert(directMatchAtoB && directMatchBtoA, 'Test 8: Direct reciprocal matching logic remains completely intact');

// --- TEST 9: No-Chain Fallback Case ---
const listingUnrelated = {
  id: 'listing_unrelated',
  userId: 'user_c',
  collegeId: 'college-srm',
  title: 'Quantum Physics Notes',
  description: 'Quantum notes for Organic Chemistry notes',
  category: Category.STUDY,
  exchangeType: ExchangeType.SWAP,
  offer: 'Quantum Physics notes',
  need: 'Organic Chemistry lab notebook',
  tags: ['physics', 'chemistry'],
  status: ListingStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const chains9 = findExchangeChainsForListing(listingA, [listingA, listingB, listingUnrelated], mockUsers);
assert(chains9.length === 0, 'Test 9: Returns clean empty array when no valid chain exists');

// --- TEST 10: Determinism Test ---
const run1 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
const run2 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
assert(JSON.stringify(run1) === JSON.stringify(run2), 'Test 10: Repeated runs produce 100% deterministic results');

console.log('\n==================================================');
console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('==================================================');

if (passed !== total) {
  process.exit(1);
}
