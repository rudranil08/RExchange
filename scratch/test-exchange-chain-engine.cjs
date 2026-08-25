// Standalone CommonJS test suite for Step 2 — Exchange Chain Engine

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'have', 'need', 'can', 'some', 'this', 'that', 'from',
  'someone', 'help', 'looking', 'want', 'seeking', 'student', 'college', 'campus', 'tech',
  'ignore', 'instructions', 'mark', '100', 'free', 'stuff', 'looking for', 'in exchange',
  'please', 'good', 'great', 'condition', 'clean', 'used', 'spare'
]);

function normalizeAcademicYear(yearValue) {
  if (yearValue === undefined || yearValue === null) return null;
  if (typeof yearValue === 'number') {
    if (yearValue >= 1 && yearValue <= 4) return yearValue;
    if (yearValue > 4) return 4;
    return null;
  }
  const str = String(yearValue).trim().toLowerCase();
  if (str === '1' || str === '1st' || str === 'first' || str === 'freshman') return 1;
  if (str === '2' || str === '2nd' || str === 'second' || str === 'sophomore') return 2;
  if (str === '3' || str === '3rd' || str === 'third' || str === 'junior') return 3;
  if (str === '4' || str === '4th' || str === 'fourth' || str === 'senior' || str === 'graduate' || str === 'grad') return 4;
  const parsed = parseInt(str, 10);
  if (!isNaN(parsed) && parsed >= 1 && parsed <= 4) return parsed;
  return null;
}

function evaluateYearCompatibility(yearA, yearB) {
  const normA = normalizeAcademicYear(yearA);
  const normB = normalizeAcademicYear(yearB);
  if (normA === null || normB === null) return { isEligible: true, yearGap: null };
  const yearGap = Math.abs(normA - normB);
  if (yearGap >= 3) return { isEligible: false, yearGap };
  return { isEligible: true, yearGap };
}

function isOfferSatisfyingNeed(offerStr, offerTags = [], needStr) {
  if (!offerStr || !needStr) return false;
  const cleanOffer = offerStr.toLowerCase().trim();
  const cleanNeed = needStr.toLowerCase().trim();
  if (cleanNeed.length < 3 || cleanNeed === 'none' || cleanNeed === 'free') return false;

  const isTutoring = (s) =>
    s.includes('tutor') || s.includes('teach') || s.includes('mentor') || s.includes('coaching') || s.includes('lesson');
  const isPhysical = (s) =>
    s.includes('textbook') || s.includes('book') || s.includes('calculator') || s.includes('coat') || s.includes('goggles') || s.includes('charger');

  if (isPhysical(cleanOffer) && !isPhysical(cleanNeed) && isTutoring(cleanNeed)) return false;
  if (isTutoring(cleanOffer) && !isTutoring(cleanNeed) && isPhysical(cleanNeed)) return false;

  const clean = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const offerTokens = (clean(cleanOffer) + ' ' + offerTags.map(clean).join(' '))
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const needTokens = clean(cleanNeed)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (offerTokens.length === 0 || needTokens.length === 0) return false;

  const domainEquivalences = [
    [['python', 'cs101', 'coding', 'bioinformatics'], ['python', 'cs101', 'programming', 'scripting', 'bioinformatics']],
    [['figma', 'ui', 'ux', 'design', 'pitch deck', 'slide deck', 'presentation'], ['figma', 'design', 'pitch deck', 'presentation', 'slides']],
    [['calculator', 'ti 84', 'graphing'], ['calculator', 'ti 84', 'graphing']],
    [['calculus', 'stewart', 'math', 'formula'], ['calculus', 'stewart', 'math', 'notes', 'cheat sheets']],
    [['pytorch', 'machine learning', 'ai', 'deep learning', 'ml'], ['pytorch', 'machine learning', 'ai', 'ml', 'capstone']],
    [['hackathon', 'ticket', 'pass', 'vip'], ['hackathon', 'ticket', 'pass', 'event']],
    [['lab coat', 'goggles', 'safety goggles', 'chemistry'], ['lab coat', 'goggles', 'safety goggles', 'chemistry']],
    [['robotics', 'rover', 'autonomous'], ['robotics', 'rover', 'automation', 'hardware']],
    [['public speaking', 'pitch coaching', 'speech', 'debate'], ['public speaking', 'pitch coaching', 'speech', 'presentation coaching']],
  ];

  for (const [groupA, groupB] of domainEquivalences) {
    const offerMatchesA = groupA.some((kw) => cleanOffer.includes(kw) || offerTags.some((t) => t.toLowerCase().includes(kw)));
    const needMatchesB = groupB.some((kw) => cleanNeed.includes(kw));
    if (offerMatchesA && needMatchesB) return true;
  }

  return offerTokens.some((ot) => needTokens.includes(ot) || cleanNeed.includes(ot));
}

function findExchangeChainsForListing(targetListing, allListings, users) {
  if (!targetListing || targetListing.status !== 'ACTIVE') return [];

  const targetCollegeId = targetListing.collegeId;
  const userA = users.find((u) => u.id === targetListing.userId);
  const yearA = userA?.year;

  const candidatePool = allListings.filter((candidate) => {
    if (candidate.collegeId !== targetCollegeId) return false;
    if (candidate.id === targetListing.id) return false;
    if (candidate.userId === targetListing.userId) return false;
    if (candidate.status !== 'ACTIVE') return false;

    const candidateUser = users.find((u) => u.id === candidate.userId);
    const candidateYear = candidateUser?.year;
    const { isEligible } = evaluateYearCompatibility(yearA, candidateYear);
    if (!isEligible) return false;
    return true;
  });

  if (candidatePool.length < 2) return [];

  const discoveredChains = [];
  const seenChainSignatures = new Set();

  for (const listingB of candidatePool) {
    const userB = users.find((u) => u.id === listingB.userId);
    const yearB = userB?.year;

    const aSatisfiesB = isOfferSatisfyingNeed(targetListing.offer, targetListing.tags, listingB.need);
    if (!aSatisfiesB) continue;

    for (const listingC of candidatePool) {
      if (listingC.id === listingB.id) continue;
      if (listingC.userId === targetListing.userId || listingC.userId === listingB.userId) continue;

      const userC = users.find((u) => u.id === listingC.userId);
      const yearC = userC?.year;

      const compatBC = evaluateYearCompatibility(yearB, yearC);
      const compatCA = evaluateYearCompatibility(yearC, yearA);
      if (!compatBC.isEligible || !compatCA.isEligible) continue;

      const bSatisfiesC = isOfferSatisfyingNeed(listingB.offer, listingB.tags, listingC.need);
      if (!bSatisfiesC) continue;

      const cSatisfiesA = isOfferSatisfyingNeed(listingC.offer, listingC.tags, targetListing.need);
      if (!cSatisfiesA) continue;

      const signature = [targetListing.id, listingB.id, listingC.id].join('->');
      if (seenChainSignatures.has(signature)) continue;
      seenChainSignatures.add(signature);

      const numA = normalizeAcademicYear(yearA) || 2;
      const numB = normalizeAcademicYear(yearB) || 2;
      const numC = normalizeAcademicYear(yearC) || 2;
      const totalYearGap = Math.abs(numA - numB) + Math.abs(numB - numC) + Math.abs(numC - numA);
      const score = totalYearGap <= 2 ? 96 : totalYearGap <= 4 ? 94 : 92;

      const edges = [
        {
          fromListingId: targetListing.id,
          toListingId: listingB.id,
          fromUserId: targetListing.userId,
          toUserId: listingB.userId,
          fromUserName: userA?.name || 'You',
          toUserName: userB?.name || 'Peer B',
          providedValue: targetListing.offer,
          receivedValue: listingB.need,
          explanation: `You give "${targetListing.offer.slice(0, 50)}" to fulfill ${userB?.name || 'Peer'}'s need.`,
        },
        {
          fromListingId: listingB.id,
          toListingId: listingC.id,
          fromUserId: listingB.userId,
          toUserId: listingC.userId,
          fromUserName: userB?.name || 'Peer B',
          toUserName: userC?.name || 'Peer C',
          providedValue: listingB.offer,
          receivedValue: listingC.need,
          explanation: `${userB?.name || 'Peer B'} gives "${listingB.offer.slice(0, 50)}" to fulfill ${userC?.name || 'Peer C'}'s need.`,
        },
        {
          fromListingId: listingC.id,
          toListingId: targetListing.id,
          fromUserId: listingC.userId,
          toUserId: targetListing.userId,
          fromUserName: userC?.name || 'Peer C',
          toUserName: userA?.name || 'You',
          providedValue: listingC.offer,
          receivedValue: targetListing.need,
          explanation: `${userC?.name || 'Peer C'} gives "${listingC.offer.slice(0, 50)}" to fulfill your need for "${targetListing.need.slice(0, 50)}".`,
        },
      ];

      const overallExplanation = `3-Person Exchange Chain: You provide ${targetListing.offer.slice(0, 40)} to ${userB?.name || 'Peer B'}, ${userB?.name || 'Peer B'} provides ${listingB.offer.slice(0, 40)} to ${userC?.name || 'Peer C'}, and ${userC?.name || 'Peer C'} provides ${listingC.offer.slice(0, 40)} to fulfill what you need.`;

      discoveredChains.push({
        id: `chain_${targetListing.id}_${listingB.id}_${listingC.id}`,
        collegeId: targetCollegeId,
        participantUserIds: [targetListing.userId, listingB.userId, listingC.userId],
        participantListingIds: [targetListing.id, listingB.id, listingC.id],
        edges,
        length: 3,
        score,
        overallExplanation,
        status: 'DISCOVERED',
        createdAt: new Date().toISOString(),
      });
    }
  }

  discoveredChains.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  return discoveredChains.slice(0, 3);
}

// === TEST EXECUTION ===
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

const mockUsers = [
  { id: 'user_a', name: 'Alice A', collegeId: 'college-srm', year: '2' },
  { id: 'user_b', name: 'Bob B', collegeId: 'college-srm', year: '2' },
  { id: 'user_c', name: 'Charlie C', collegeId: 'college-srm', year: '3' },
  { id: 'user_d_senior', name: 'Dan Senior', collegeId: 'college-srm', year: '4' },
  { id: 'user_e_freshman', name: 'Eve Freshman', collegeId: 'college-srm', year: '1' },
  { id: 'user_cross_college', name: 'Cross Student', collegeId: 'college-vit', year: '2' },
];

const listingA = {
  id: 'listing_a',
  userId: 'user_a',
  collegeId: 'college-srm',
  title: 'TI-84 Graphing Calculator for Python',
  offer: 'TI-84 Plus Graphing Calculator with charger',
  need: 'Python programming fundamentals & CS101 tutoring',
  tags: ['calculator', 'ti-84', 'python', 'tutoring'],
  status: 'ACTIVE',
};

const listingB = {
  id: 'listing_b',
  userId: 'user_b',
  collegeId: 'college-srm',
  title: 'Python Tutoring for Figma Design',
  offer: 'Python programming fundamentals & CS101 tutoring',
  need: 'High-impact Figma pitch deck and presentation slide design',
  tags: ['python', 'tutoring', 'figma', 'design'],
  status: 'ACTIVE',
};

const listingC = {
  id: 'listing_c',
  userId: 'user_c',
  collegeId: 'college-srm',
  title: 'Figma Design for Calculator',
  offer: 'High-impact Figma pitch deck and presentation slide design',
  need: 'TI-84 Plus Graphing Calculator with charger',
  tags: ['figma', 'design', 'calculator', 'ti-84'],
  status: 'ACTIVE',
};

// 1. Valid 3-person chain
const chains1 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
assert(chains1.length === 1, 'Test 1: Successfully discovered valid 3-person chain');
assert(chains1[0]?.participantUserIds.length === 3, 'Test 1: Exactly 3 participants');
assert(chains1[0]?.edges.length === 3, 'Test 1: Exactly 3 edges');
assert(chains1[0]?.score >= 90, `Test 1: Score is strong (${chains1[0]?.score})`);
const e0 = chains1[0]?.edges[0];
const e1 = chains1[0]?.edges[1];
const e2 = chains1[0]?.edges[2];
assert(e0.fromUserId === 'user_a', 'Test 1: Edge 1 starts from user_a');
assert(e0.toUserId === e1.fromUserId, 'Test 1: Edge 1 target equals Edge 2 source');
assert(e1.toUserId === e2.fromUserId, 'Test 1: Edge 2 target equals Edge 3 source');
assert(e2.toUserId === 'user_a', 'Test 1: Edge 3 closes loop back to user_a');

// 2. Incomplete chain
const listingC_broken = {
  ...listingC,
  id: 'listing_c_broken',
  offer: 'Figma pitch deck',
  need: 'Video editing', // Does NOT satisfy A (Calculator)
  tags: ['figma'],
};
const chains2 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC_broken], mockUsers);
assert(chains2.length === 0, 'Test 2: Incomplete chain correctly rejected');

// 3. Self-match
const listingB_owned_by_A = { ...listingB, id: 'listing_b_by_a', userId: 'user_a' };
const chains3 = findExchangeChainsForListing(listingA, [listingA, listingB_owned_by_A, listingC], mockUsers);
assert(chains3.length === 0, 'Test 3: Self-match strictly rejected');

// 4. Duplicate participant
const listingC_owned_by_B = { ...listingC, id: 'listing_c_by_b', userId: 'user_b' };
const chains4 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC_owned_by_B], mockUsers);
assert(chains4.length === 0, 'Test 4: Duplicate participant strictly rejected');

// 5. Cross-college
const listingC_cross = { ...listingC, id: 'listing_c_cross', userId: 'user_cross_college', collegeId: 'college-vit' };
const chains5 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC_cross], mockUsers);
assert(chains5.length === 0, 'Test 5: Cross-college participant strictly blocked');

// 6. Invalid year gap (1st ↔ 4th)
const listingA_freshman = { ...listingA, userId: 'user_e_freshman' };
const listingC_senior = { ...listingC, userId: 'user_d_senior' };
const chains6 = findExchangeChainsForListing(listingA_freshman, [listingA_freshman, listingB, listingC_senior], mockUsers);
assert(chains6.length === 0, 'Test 6: Year gap >= 3 strictly rejected');

// 7. Valid year gap (1st ↔ 2nd ↔ 3rd)
const chains7 = findExchangeChainsForListing(listingA_freshman, [listingA_freshman, listingB, listingC], mockUsers);
assert(chains7.length === 1, 'Test 7: Valid year gaps permitted');

// 8. Direct match regression
const directAtoB = isOfferSatisfyingNeed(listingB.offer, listingB.tags, listingA.need);
const directBtoA = isOfferSatisfyingNeed(listingA.offer, listingA.tags, listingB.need);
assert(directAtoB && !directBtoA, 'Test 8: Direct one-way and reciprocal evaluation intact');

// 9. No-chain case
const listingUnrelated = {
  id: 'listing_unrelated',
  userId: 'user_c',
  collegeId: 'college-srm',
  offer: 'Quantum notes',
  need: 'Organic Chemistry notes',
  tags: ['physics'],
  status: 'ACTIVE',
};
const chains9 = findExchangeChainsForListing(listingA, [listingA, listingB, listingUnrelated], mockUsers);
assert(chains9.length === 0, 'Test 9: Returns clean empty array when no chain exists');

// 10. Deterministic result
const r1 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
const r2 = findExchangeChainsForListing(listingA, [listingA, listingB, listingC], mockUsers);
assert(JSON.stringify(r1) === JSON.stringify(r2), 'Test 10: 100% deterministic results across runs');

console.log('\n==================================================');
console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
console.log('==================================================');

if (passed !== total) {
  process.exit(1);
}
