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

// In-line discovery logic to mirror lib/matching/matchability-discovery.ts
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'have', 'need', 'can', 'some', 'this', 'that', 'from',
  'someone', 'help', 'looking', 'want', 'seeking', 'student', 'college', 'campus', 'tech',
  'ignore', 'instructions', 'mark', '100', 'free', 'stuff', 'looking for', 'in exchange',
  'please', 'good', 'great', 'condition', 'clean', 'used', 'spare'
]);

function isOfferSatisfyingNeed(offerStr, offerTags = [], needStr) {
  if (!offerStr || !needStr) return false;
  const cleanOffer = offerStr.toLowerCase().trim();
  const cleanNeed = needStr.toLowerCase().trim();

  if (cleanNeed.length < 3 || cleanNeed === 'none' || cleanNeed === 'free') return false;

  const domainEquivalences = [
    [['python', 'cs101', 'coding', 'bioinformatics'], ['python', 'cs101', 'programming', 'scripting', 'bioinformatics']],
    [['figma', 'ui', 'ux', 'design', 'pitch deck', 'slide deck', 'presentation'], ['figma', 'design', 'pitch deck', 'presentation', 'slides']],
    [['calculator', 'ti 84', 'graphing'], ['calculator', 'ti 84', 'graphing']],
    [['calculus', 'stewart', 'math', 'formula'], ['calculus', 'stewart', 'math', 'notes', 'cheat sheets']],
    [['pytorch', 'machine learning', 'ai', 'deep learning', 'ml'], ['pytorch', 'machine learning', 'ai', 'ml', 'capstone']],
  ];

  for (const [groupA, groupB] of domainEquivalences) {
    const offerMatchesA = groupA.some((kw) => cleanOffer.includes(kw) || offerTags.some((t) => t.toLowerCase().includes(kw)));
    const needMatchesB = groupB.some((kw) => cleanNeed.includes(kw));
    if (offerMatchesA && needMatchesB) {
      return true;
    }
  }

  const clean = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const offerTokens = (clean(cleanOffer) + ' ' + offerTags.map(clean).join(' ')).split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const needTokens = clean(cleanNeed).split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return offerTokens.some((ot) => needTokens.includes(ot) || cleanNeed.includes(ot));
}

function findMatchabilityRecommendations(targetListing, user, allListings, allUsers = []) {
  if (!targetListing || !user) return [];
  const collegeId = user.collegeId || targetListing.collegeId;
  const targetNeed = targetListing.need || '';

  const rawCapabilities = Array.from(
    new Set([...(user.selectedSkills || []), ...(user.derivedSkills || [])])
  ).filter((s) => s && s.trim().length > 1);

  if (rawCapabilities.length === 0) return [];

  const eligibleCandidateListings = allListings.filter((candidate) => {
    if (candidate.collegeId !== collegeId) return false;
    if (candidate.userId === user.id) return false;
    if (candidate.id === targetListing.id) return false;
    if (candidate.status !== 'ACTIVE') return false;
    return true;
  });

  const recommendations = [];

  for (const capability of rawCapabilities) {
    const demandListings = eligibleCandidateListings.filter((candidate) => {
      return isOfferSatisfyingNeed(capability, [capability], candidate.need);
    });

    const demandCount = demandListings.length;
    if (demandCount === 0) continue;

    let directOpportunityListing;
    if (targetNeed && targetNeed.toLowerCase() !== 'none' && targetNeed.length > 2) {
      directOpportunityListing = demandListings.find((candidate) => {
        return isOfferSatisfyingNeed(candidate.offer, candidate.tags, targetNeed);
      });
    }

    let explanation = `${demandCount} student${demandCount === 1 ? '' : 's'} at your college currently requested this capability.`;
    let potentialOpportunity;
    let relevanceScore = demandCount * 10;

    if (directOpportunityListing) {
      relevanceScore += 50;
      explanation = `${directOpportunityListing.creatorName || 'A student'} is currently offering a ${directOpportunityListing.offer.slice(0, 45)} and seeking ${capability}.`;
      potentialOpportunity = {
        listingId: directOpportunityListing.id,
        peerName: directOpportunityListing.creatorName || 'Student Peer',
        peerContext: directOpportunityListing.creatorContext || 'Campus Student',
        peerOffer: directOpportunityListing.offer,
        peerNeed: directOpportunityListing.need,
      };
    }

    recommendations.push({
      id: `matchability_${user.id}_${capability.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      userId: user.id,
      targetNeed,
      capability: capability.includes('tutor') || capability.includes('design') ? capability : `${capability} tutoring / assistance`,
      eligibleDemandCount: demandCount,
      explanation,
      potentialOpportunity,
      relevanceScore,
    });
  }

  return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

async function runMakeMeMatchableSuite() {
  console.log('==================================================');
  console.log('   MAKE ME MATCHABLE UI & ENGINE TEST SUITE       ');
  console.log('==================================================\n');

  const mockAlex = {
    id: 'user_alex',
    name: 'Alex Morgan',
    collegeId: 'college-srm',
    year: 'Junior',
    selectedSkills: ['Python', 'Figma', 'Calculus'],
    derivedSkills: ['Python'],
  };

  const mockListings = [
    {
      id: 'listing_sarah_01',
      userId: 'user_sarah',
      collegeId: 'college-srm',
      creatorName: 'Sarah Khan',
      creatorContext: 'Sophomore • Design',
      offer: 'Figma UI/UX Pitch Deck Design for Hackathons',
      need: 'Python programming fundamentals and CS101 tutoring',
      tags: ['figma', 'design', 'python', 'tutoring'],
      status: 'ACTIVE',
    },
    {
      id: 'listing_priya_01',
      userId: 'user_priya',
      collegeId: 'college-srm',
      creatorName: 'Priya Sharma',
      creatorContext: 'Sophomore • Mathematics',
      offer: 'TI-84 Plus CE Graphing Calculator with charger',
      need: 'Python bioinformatics sequence analysis scripts',
      tags: ['calculator', 'tech', 'python', 'bioinformatics'],
      status: 'ACTIVE',
    },
    {
      id: 'listing_karthik_01',
      userId: 'user_karthik',
      collegeId: 'college-srm',
      creatorName: 'Karthik Raja',
      creatorContext: 'Junior • Robotics',
      offer: 'Autonomous rover robotics collaboration',
      need: 'Python programming fundamentals & CS101 tutoring',
      tags: ['robotics', 'python'],
      status: 'ACTIVE',
    },
  ];

  const asymmetricListing = {
    id: 'listing_demo_asymmetric_01',
    userId: 'user_alex',
    collegeId: 'college-srm',
    creatorName: 'Alex Morgan',
    offer: 'Nothing useful',
    need: 'TI-84 Plus CE Graphing Calculator with charger',
    tags: ['calculator', 'tech'],
    status: 'ACTIVE',
  };

  // Test 1: Run Make Me Matchable
  const recs = findMatchabilityRecommendations(asymmetricListing, mockAlex, mockListings);
  assert(recs.length > 0, 'Test 1: Successfully generated capability recommendations');

  const pythonRec = recs.find((r) => r.capability.toLowerCase().includes('python'));
  assert(pythonRec !== undefined, 'Test 2: Python capability recommended based on authentic skills');
  assert(pythonRec.eligibleDemandCount === 3, `Test 3: Correct real SRM campus demand count computed (3 students)`);
  assert(pythonRec.potentialOpportunity !== undefined, 'Test 4: Direct trade opportunity with Priya Sharma identified');
  assert(pythonRec.potentialOpportunity?.peerName === 'Priya Sharma', 'Test 5: Priya Sharma correctly identified as trade partner');

  // Test 6: Cross-College Exclusion
  const vitListings = mockListings.map((l) => ({ ...l, collegeId: 'college-vit-chennai' }));
  const crossCollegeRecs = findMatchabilityRecommendations(asymmetricListing, mockAlex, vitListings);
  assert(crossCollegeRecs.length === 0, 'Test 6: Cross-college demand strictly excluded (returns 0 recommendations)');

  // Test 7: Self-Match Exclusion
  const selfListings = [
    {
      id: 'listing_alex_self',
      userId: 'user_alex',
      collegeId: 'college-srm',
      offer: 'Item',
      need: 'Python tutoring',
      tags: ['python'],
      status: 'ACTIVE',
    },
  ];
  const selfRecs = findMatchabilityRecommendations(asymmetricListing, mockAlex, selfListings);
  assert(selfRecs.length === 0, 'Test 7: User own listings strictly excluded from demand calculations');

  // Test 8: HTTP Route Health Check
  const routes = [
    '/',
    '/login',
    '/matches',
    '/matches?listing=listing_sarah_01',
    '/exchange/new',
    '/exchange/new?offer=Python%20tutoring&need=TI-84%20Calculator',
    '/profile',
    '/my-exchanges',
  ];

  for (const route of routes) {
    try {
      const res = await fetchRoute(route);
      assert(res.statusCode === 200, `Test 8: Route GET ${route} returns HTTP 200`);
    } catch (err) {
      assert(false, `Test 8: Route GET ${route} failed: ${err.message}`);
    }
  }

  console.log('\n==================================================');
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('==================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runMakeMeMatchableSuite();
