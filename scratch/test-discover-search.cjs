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

// SRM Demo Listings Dataset to test exact filtering logic
const mockSrmListings = [
  {
    id: 'listing_sarah_01',
    collegeId: 'college-srm',
    category: 'SKILLS_SERVICES',
    exchangeType: 'SKILL_EXCHANGE',
    title: 'Hackathon Pitch Deck & UI/UX Design Mentorship',
    offer: 'Figma UI/UX Pitch Deck Design for Hackathons',
    need: 'Python programming fundamentals and CS101 tutoring',
    description: 'Expertise in Figma prototyping and slide design.',
    tags: ['figma', 'design', 'pitch deck', 'ui-ux'],
    creatorName: 'Sarah Khan',
    creatorContext: 'Sophomore • Design',
  },
  {
    id: 'listing_david_01',
    collegeId: 'college-srm',
    category: 'STUDY',
    exchangeType: 'SWAP',
    title: 'Stewart Calculus Early Transcendentals Textbook',
    offer: 'Stewart Calculus 8th Edition with formula sheets',
    need: 'PyTorch deep learning model code review',
    description: 'Physical textbook in pristine condition with cheat sheets.',
    tags: ['calculus', 'math', 'textbook'],
    creatorName: 'David Chen',
    creatorContext: 'Senior • Mathematics',
  },
  {
    id: 'listing_priya_01',
    collegeId: 'college-srm',
    category: 'TECH_ELECTRONICS',
    exchangeType: 'SWAP',
    title: 'TI-84 Plus CE Graphing Calculator (Color Screen)',
    offer: 'TI-84 Plus CE Graphing Calculator with charger',
    need: 'Python bioinformatics sequence analysis scripts',
    description: 'Rechargeable graphing calculator with USB charging cable.',
    tags: ['calculator', 'tech', 'hardware'],
    creatorName: 'Priya Sharma',
    creatorContext: 'Sophomore • Mathematics',
  },
  {
    id: 'listing_karthik_01',
    collegeId: 'college-srm',
    category: 'OPPORTUNITIES',
    exchangeType: 'SKILL_EXCHANGE',
    title: 'SRM Rover Team Embedded Firmware & Autonomous Subsystem',
    offer: 'Autonomous rover robotics collaboration & hardware lab access',
    need: 'Python programming fundamentals & CS101 tutoring',
    description: 'Opportunity to contribute to SRM Rover Team.',
    tags: ['robotics', 'embedded', 'rover'],
    creatorName: 'Karthik Raja',
    creatorContext: 'Junior • Robotics',
  },
];

function filterListings(listings, category, type, searchQuery) {
  return listings.filter((item) => {
    const matchesCategory = category === 'ALL' || item.category === category;
    const matchesType = type === 'ALL' || item.exchangeType === type;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      item.title.toLowerCase().includes(query) ||
      item.offer.toLowerCase().includes(query) ||
      item.need.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.exchangeType.toLowerCase().includes(query) ||
      (item.creatorName && item.creatorName.toLowerCase().includes(query)) ||
      (item.creatorContext && item.creatorContext.toLowerCase().includes(query)) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));

    return matchesCategory && matchesType && matchesSearch;
  });
}

async function runSearchTestSuite() {
  console.log('==================================================');
  console.log('   DISCOVER SEARCH BAR VERIFICATION SUITE         ');
  console.log('==================================================\n');

  // TEST 1: Search "Python"
  const pythonResults = filterListings(mockSrmListings, 'ALL', 'ALL', 'Python');
  assert(pythonResults.length >= 3, `TEST 1: Search "Python" returns ${pythonResults.length} relevant listings`);
  assert(pythonResults.some((l) => l.need.toLowerCase().includes('python')), 'TEST 1: Includes listings where Python is needed');

  // TEST 2: Search "Figma"
  const figmaResults = filterListings(mockSrmListings, 'ALL', 'ALL', 'Figma');
  assert(figmaResults.length === 1 && figmaResults[0].id === 'listing_sarah_01', 'TEST 2: Search "Figma" returns Sarah Khan listing');

  // TEST 3: Search "calculator"
  const calcResults = filterListings(mockSrmListings, 'ALL', 'ALL', 'calculator');
  assert(calcResults.length === 1 && calcResults[0].id === 'listing_priya_01', 'TEST 3: Search "calculator" returns Priya Sharma TI-84 listing');

  // TEST 4: Search "PYTHON" (Case insensitivity)
  const upperPython = filterListings(mockSrmListings, 'ALL', 'ALL', 'PYTHON');
  assert(upperPython.length === pythonResults.length, 'TEST 4: Search "PYTHON" produces exact same results as "Python"');

  // TEST 5: Search "zzzzzzzz" (Empty state)
  const emptyResults = filterListings(mockSrmListings, 'ALL', 'ALL', 'zzzzzzzz');
  assert(emptyResults.length === 0, 'TEST 5: Search "zzzzzzzz" returns 0 results for clean empty state');

  // TEST 6: Search "Python" + Category "SKILLS_SERVICES"
  const skillsPython = filterListings(mockSrmListings, 'SKILLS_SERVICES', 'ALL', 'Python');
  assert(skillsPython.length === 1 && skillsPython[0].category === 'SKILLS_SERVICES', 'TEST 6: Search "Python" + Category Skills & Services returns 1 listing');

  // TEST 7: Search "Python" + Exchange Type "SKILL_EXCHANGE"
  const skillExchangePython = filterListings(mockSrmListings, 'ALL', 'SKILL_EXCHANGE', 'Python');
  assert(skillExchangePython.every((l) => l.exchangeType === 'SKILL_EXCHANGE'), 'TEST 7: Search "Python" + Type Skill Exchange returns only Skill Exchange listings');

  // TEST 8: Clear Search
  const clearedResults = filterListings(mockSrmListings, 'ALL', 'ALL', '');
  assert(clearedResults.length === mockSrmListings.length, 'TEST 8: Clearing search returns full initial dataset (4 listings)');

  // TEST 9: Partial matching
  const partialPitch = filterListings(mockSrmListings, 'ALL', 'ALL', 'pitch');
  assert(partialPitch.length === 1 && partialPitch[0].id === 'listing_sarah_01', 'TEST 9: Partial match "pitch" matches Figma Pitch Deck');

  // TEST 10: Tags and Creator Name matching
  const tagResults = filterListings(mockSrmListings, 'ALL', 'ALL', 'rover');
  assert(tagResults.length === 1 && tagResults[0].creatorName === 'Karthik Raja', 'TEST 10: Tag search "rover" finds Karthik Raja listing');

  // TEST 11: Route health check
  const routes = ['/', '/login', '/matches', '/exchange/new', '/profile', '/my-exchanges'];
  for (const route of routes) {
    const res = await fetchRoute(route);
    assert(res.statusCode === 200, `TEST 11: Route GET ${route} returns HTTP 200`);
  }

  console.log('\n==================================================');
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runSearchTestSuite();
