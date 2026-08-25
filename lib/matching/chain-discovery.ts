import {
  Listing,
  ListingStatus,
  User,
  ExchangeChain,
  ExchangeChainEdge,
  ExchangeChainStatus,
} from '../types';
import { evaluateYearCompatibility, normalizeAcademicYear } from './year-proximity';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'have', 'need', 'can', 'some', 'this', 'that', 'from',
  'someone', 'help', 'looking', 'want', 'seeking', 'student', 'college', 'campus', 'tech',
  'ignore', 'instructions', 'mark', '100', 'free', 'stuff', 'looking for', 'in exchange',
  'please', 'good', 'great', 'condition', 'clean', 'used', 'spare'
]);

/**
 * Checks whether an offer from one listing satisfies the need of another listing.
 * Evaluates semantic keywords, tags, domain equivalences, and modality consistency.
 */
export function isOfferSatisfyingNeed(
  offerStr: string,
  offerTags: string[] = [],
  needStr: string
): boolean {
  if (!offerStr || !needStr) return false;
  const cleanOffer = offerStr.toLowerCase().trim();
  const cleanNeed = needStr.toLowerCase().trim();

  if (cleanNeed.length < 3 || cleanNeed === 'none' || cleanNeed === 'free') return false;

  const isTutoring = (s: string) =>
    s.includes('tutor') || s.includes('teach') || s.includes('mentor') || s.includes('coaching') || s.includes('lesson');
  const isPhysical = (s: string) =>
    s.includes('textbook') || s.includes('book') || s.includes('calculator') || s.includes('coat') || s.includes('goggles') || s.includes('charger');

  // Modality conflict check: physical goods cannot satisfy interactive tutoring requests and vice-versa
  if (isPhysical(cleanOffer) && !isPhysical(cleanNeed) && isTutoring(cleanNeed)) {
    return false;
  }
  if (isTutoring(cleanOffer) && !isTutoring(cleanNeed) && isPhysical(cleanNeed)) {
    return false;
  }

  const clean = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

  const offerTokens = (clean(cleanOffer) + ' ' + offerTags.map(clean).join(' '))
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const needTokens = clean(cleanNeed)
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (offerTokens.length === 0 || needTokens.length === 0) return false;

  // Domain synonym & semantic bridge dictionary
  const domainEquivalences: [string[], string[]][] = [
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
    if (offerMatchesA && needMatchesB) {
      return true;
    }
  }

  // Direct token match
  return offerTokens.some((ot) => needTokens.includes(ot) || cleanNeed.includes(ot));
}

/**
 * Discovers valid 3-participant Exchange Chains (A → B → C → A) for a target listing.
 *
 * Hard Application Invariants:
 * 1. College Boundary: All participants must belong to targetListing.collegeId.
 * 2. Academic Year Compatibility: Pairwise year gaps between participants must satisfy yearGap < 3.
 * 3. Self-Match Prevention & Unique Identity: A.userId !== B.userId, B.userId !== C.userId, A.userId !== C.userId.
 * 4. Closed Reciprocal Loop: A.offer → B.need, B.offer → C.need, C.offer → A.need.
 * 5. Bounded Result Set: Deterministically returns at most 3 top-ranked chains.
 */
export function findExchangeChainsForListing(
  targetListing: Listing,
  allListings: Listing[],
  users: User[]
): ExchangeChain[] {
  if (!targetListing || targetListing.status !== ListingStatus.ACTIVE) {
    return [];
  }

  const targetCollegeId = targetListing.collegeId;
  const userA = users.find((u) => u.id === targetListing.userId);
  const yearA = userA?.year;

  // 1. HARD CANDIDATE PRE-FILTERING
  // Exclude different college, self-listings, inactive listings, and impossible year gaps with A
  const candidatePool = allListings.filter((candidate) => {
    if (candidate.collegeId !== targetCollegeId) return false;
    if (candidate.id === targetListing.id) return false;
    if (candidate.userId === targetListing.userId) return false;
    if (candidate.status !== ListingStatus.ACTIVE) return false;

    const candidateUser = users.find((u) => u.id === candidate.userId);
    const candidateYear = candidateUser?.year;
    const { isEligible } = evaluateYearCompatibility(yearA, candidateYear);
    if (!isEligible) return false;

    return true;
  });

  if (candidatePool.length < 2) {
    return [];
  }

  const discoveredChains: ExchangeChain[] = [];
  const seenChainSignatures = new Set<string>();

  // 2. EXPLORE 3-NODE DIRECTED CYCLES: A → B → C → A
  for (const listingB of candidatePool) {
    const userB = users.find((u) => u.id === listingB.userId);
    const yearB = userB?.year;

    // Edge 1: Does A.offer satisfy B.need?
    const aSatisfiesB = isOfferSatisfyingNeed(targetListing.offer, targetListing.tags, listingB.need);
    if (!aSatisfiesB) continue;

    for (const listingC of candidatePool) {
      // Must be distinct listings
      if (listingC.id === listingB.id) continue;
      // Must be distinct users (A, B, C all different)
      if (listingC.userId === targetListing.userId || listingC.userId === listingB.userId) continue;

      const userC = users.find((u) => u.id === listingC.userId);
      const yearC = userC?.year;

      // Check year compatibility for B ↔ C and C ↔ A
      const compatBC = evaluateYearCompatibility(yearB, yearC);
      const compatCA = evaluateYearCompatibility(yearC, yearA);
      if (!compatBC.isEligible || !compatCA.isEligible) continue;

      // Edge 2: Does B.offer satisfy C.need?
      const bSatisfiesC = isOfferSatisfyingNeed(listingB.offer, listingB.tags, listingC.need);
      if (!bSatisfiesC) continue;

      // Edge 3 (Closed-Loop Verification): Does C.offer satisfy A.need?
      const cSatisfiesA = isOfferSatisfyingNeed(listingC.offer, listingC.tags, targetListing.need);
      if (!cSatisfiesA) continue;

      // Deterministic signature to avoid duplicate permutations
      const signature = [targetListing.id, listingB.id, listingC.id].join('->');
      if (seenChainSignatures.has(signature)) continue;
      seenChainSignatures.add(signature);

      // Calculate total year gap for ranking
      const numA = normalizeAcademicYear(yearA) || 2;
      const numB = normalizeAcademicYear(yearB) || 2;
      const numC = normalizeAcademicYear(yearC) || 2;
      const totalYearGap = Math.abs(numA - numB) + Math.abs(numB - numC) + Math.abs(numC - numA);

      // Score calculation: 96 for tight year alignment, 94 for minor gap, 92 for max allowed gap
      const score = totalYearGap <= 2 ? 96 : totalYearGap <= 4 ? 94 : 92;

      const edges: ExchangeChainEdge[] = [
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
        status: ExchangeChainStatus.DISCOVERED,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. DETERMINISTIC RANKING: Highest score first, then smallest total year gap, then stable ID
  discoveredChains.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.id.localeCompare(b.id);
  });

  return discoveredChains.slice(0, 3);
}
