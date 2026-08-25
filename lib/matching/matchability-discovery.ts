import {
  Listing,
  ListingStatus,
  User,
  MatchabilityRecommendation,
} from '../types';
import { evaluateYearCompatibility } from './year-proximity';
import { isOfferSatisfyingNeed } from './chain-discovery';

/**
 * Discovers Make Me Matchable capability recommendations for a student listing.
 *
 * Rules:
 * 1. Grounded Capabilities: Evaluates only authentic student capabilities (selectedSkills + derivedSkills).
 * 2. Same College Boundary: Scans candidate listings exclusively within user.collegeId.
 * 3. Year Proximity Compatibility: Pairwise yearGap < 3 between user and demand candidates.
 * 4. Self-Match Prevention: Excludes target user's own listings.
 * 5. Deterministic Ranking: Prioritizes capabilities unlocking direct opportunities for targetNeed, then by demand count.
 */
export function findMatchabilityRecommendations(
  targetListing: Listing,
  user: User,
  allListings: Listing[],
  allUsers: User[] = []
): MatchabilityRecommendation[] {
  if (!targetListing || !user) return [];

  const collegeId = user.collegeId || targetListing.collegeId;
  const targetNeed = targetListing.need || '';

  // Get authentic user capabilities
  const rawCapabilities = Array.from(
    new Set([
      ...(user.selectedSkills || []),
      ...(user.derivedSkills || []),
    ])
  ).filter((s) => s && s.trim().length > 1);

  if (rawCapabilities.length === 0) {
    return [];
  }

  // Pre-filter candidate listings strictly within the same college
  const eligibleCandidateListings = allListings.filter((candidate) => {
    if (candidate.collegeId !== collegeId) return false;
    if (candidate.userId === user.id) return false;
    if (candidate.id === targetListing.id) return false;
    if (candidate.status !== ListingStatus.ACTIVE) return false;

    // Year proximity check if candidate user exists
    const candidateUser = allUsers.find((u) => u.id === candidate.userId);
    if (candidateUser && user.year && candidateUser.year) {
      const yearCompat = evaluateYearCompatibility(user.year, candidateUser.year);
      if (!yearCompat.isEligible) return false;
    }

    return true;
  });

  const recommendations: MatchabilityRecommendation[] = [];

  for (const capability of rawCapabilities) {
    // Find all eligible listings on campus seeking this capability
    const demandListings = eligibleCandidateListings.filter((candidate) => {
      return isOfferSatisfyingNeed(capability, [capability], candidate.need);
    });

    const demandCount = demandListings.length;
    if (demandCount === 0) continue;

    // Check if any of these demand listings ALSO offer what the student needs
    let directOpportunityListing: Listing | undefined;
    if (targetNeed && targetNeed.toLowerCase() !== 'none' && targetNeed.length > 2) {
      directOpportunityListing = demandListings.find((candidate) => {
        return isOfferSatisfyingNeed(candidate.offer, candidate.tags, targetNeed);
      });
    }

    let explanation = `${demandCount} student${demandCount === 1 ? '' : 's'} at your college currently requested this capability.`;
    let potentialOpportunity;
    let relevanceScore = demandCount * 10;

    if (directOpportunityListing) {
      relevanceScore += 50; // Boost score when direct trade potential is present
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

  // Sort deterministically: highest relevance score, then highest demand count, then alphabetical capability
  return recommendations
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      if (b.eligibleDemandCount !== a.eligibleDemandCount) {
        return b.eligibleDemandCount - a.eligibleDemandCount;
      }
      return a.capability.localeCompare(b.capability);
    })
    .slice(0, 4);
}
