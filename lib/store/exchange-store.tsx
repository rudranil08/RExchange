'use client';

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Listing,
  ListingStatus,
  User,
  Category,
  ExchangeType,
  Match,
  MatchStatus,
  Exchange,
  ExchangeStatus,
  College,
  ExchangeChain,
  MatchabilityRecommendation,
} from '@/lib/types';
import {
  INITIAL_SEED_LISTINGS,
  SEED_USERS,
  INITIAL_SEED_EXCHANGES,
  COLLEGES,
  ONBOARDING_SKILLS,
} from '@/lib/data/seed-data';
import { evaluateYearCompatibility } from '@/lib/matching/year-proximity';
import { findExchangeChainsForListing as discoverChains } from '@/lib/matching/chain-discovery';
import { findMatchabilityRecommendations } from '@/lib/matching/matchability-discovery';

interface ExchangeStoreContextType {
  // Session & User
  users: User[];
  activeUser: User | null;
  colleges: College[];
  activeCollege: College | null;
  onboardingSkills: string[];
  login: (email: string, collegeId: string) => User;
  signup: (data: {
    email: string;
    name: string;
    collegeId: string;
    course: string;
    year: string;
    selectedSkills: string[];
  }) => User;
  logout: () => void;
  switchUser: (userId: string) => void;

  // Search & Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Listings (Global & College Scoped)
  listings: Listing[];
  collegeListings: Listing[];
  newlyCreatedId: string | null;
  activeListingForMatching: Listing | null;
  addListing: (listingData: {
    title: string;
    description: string;
    category: Category;
    exchangeType: ExchangeType;
    offer: string;
    need: string;
    tags?: string[];
  }) => Listing;

  // Matching (College-Scoped Boundary)
  matches: Match[];
  selectedMatch: Match | null;
  isMatching: boolean;
  findMatchesForListing: (targetListing: Listing) => Promise<Match[]>;
  findExchangeChainsForListing: (targetListing: Listing) => ExchangeChain[];
  findMatchabilityRecommendationsForListing: (targetListing: Listing) => MatchabilityRecommendation[];
  setActiveListingForMatching: (listing: Listing | null) => void;
  selectMatch: (match: Match | null) => void;
  acceptMatch: (matchId: string) => Match | undefined;
  declineMatch: (matchId: string) => void;

  // Exchange State Machine
  exchanges: Exchange[];
  activeExchange: Exchange | null;
  createOrGetExchange: (match: Match) => Exchange;
  confirmExchange: (exchangeId: string) => Exchange | undefined;
  cancelExchange: (exchangeId: string) => Exchange | undefined;
  setActiveExchange: (exchange: Exchange | null) => void;

  // Reset & Clear
  resetStore: () => void;
  clearNewlyCreated: () => void;
}

const ExchangeStoreContext = createContext<ExchangeStoreContextType | undefined>(undefined);

export function ExchangeStoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [activeUserId, setActiveUserId] = useState<string | null>(SEED_USERS[0].id); // Default: Alex Morgan
  const [listings, setListings] = useState<Listing[]>(INITIAL_SEED_LISTINGS);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active User & College Derivation
  const activeUser = useMemo(() => {
    return users.find((u) => u.id === activeUserId) || null;
  }, [users, activeUserId]);

  const activeCollege = useMemo(() => {
    if (!activeUser) return COLLEGES[0];
    return COLLEGES.find((c) => c.id === activeUser.collegeId) || COLLEGES[0];
  }, [activeUser]);

  // College-Scoped Listings (Strict application boundary)
  const collegeListings = useMemo(() => {
    if (!activeUser) return [];
    return listings.filter((l) => l.collegeId === activeUser.collegeId);
  }, [listings, activeUser]);

  // Matching State
  const [activeListingForMatching, setActiveListingForMatching] = useState<Listing | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Exchange State Machine
  const [exchanges, setExchanges] = useState<Exchange[]>(INITIAL_SEED_EXCHANGES);
  const [activeExchange, setActiveExchange] = useState<Exchange | null>(INITIAL_SEED_EXCHANGES[0]);

  // === Authentication & Onboarding Actions ===

  const login = (email: string, collegeId: string): User => {
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.collegeId === collegeId
    );

    if (existing) {
      setActiveUserId(existing.id);
      return existing;
    }

    // Auto-provision demo student session for frictionless testing
    const namePart = email.split('@')[0] || 'Campus Student';
    const formattedName = namePart
      .split('.')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      name: formattedName,
      collegeId,
      course: 'General Studies',
      year: 'Junior',
      contactHandle: email,
      selectedSkills: ['Python', 'Writing'],
      derivedSkills: [],
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setActiveUserId(newUser.id);
    return newUser;
  };

  const signup = (data: {
    email: string;
    name: string;
    collegeId: string;
    course: string;
    year: string;
    selectedSkills: string[];
  }): User => {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: data.email.trim(),
      name: data.name.trim(),
      collegeId: data.collegeId,
      course: data.course.trim(),
      year: data.year.trim(),
      contactHandle: data.email.trim(),
      selectedSkills: data.selectedSkills,
      derivedSkills: [],
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setActiveUserId(newUser.id);
    return newUser;
  };

  const logout = () => {
    setActiveUserId(null);
    setActiveListingForMatching(null);
    setMatches([]);
    setSelectedMatch(null);
    setActiveExchange(null);
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setActiveUserId(found.id);
      setActiveListingForMatching(null);
      setMatches([]);
      setSelectedMatch(null);
    }
  };

  // === Listing Management & Derived Capability Signal Extraction ===

  const addListing = (data: {
    title: string;
    description: string;
    category: Category;
    exchangeType: ExchangeType;
    offer: string;
    need: string;
    tags?: string[];
  }): Listing => {
    const timestamp = new Date().toISOString();
    const newId = `listing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const collegeId = activeUser?.collegeId || 'college-srm';

    const newListing: Listing = {
      id: newId,
      userId: activeUser ? activeUser.id : 'user_guest',
      collegeId,
      creatorName: activeUser ? activeUser.name : 'Campus Peer',
      creatorContext: activeUser ? `${activeUser.year} • ${activeUser.course}` : 'Campus Student',
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      exchangeType: data.exchangeType,
      offer: data.offer.trim(),
      need: data.need.trim() || 'None',
      tags:
        data.tags && data.tags.length > 0
          ? data.tags
          : data.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 4),
      status: ListingStatus.ACTIVE,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 1. Add listing to global state
    setListings((prev) => [newListing, ...prev]);
    setNewlyCreatedId(newId);
    setActiveListingForMatching(newListing);

    // 2. Extract derived capability signal strictly from HAVE / OFFER (never from NEED)
    if (activeUser) {
      const offerLower = data.offer.toLowerCase();
      const detectedSkill = ONBOARDING_SKILLS.find((skill) =>
        offerLower.includes(skill.toLowerCase())
      );

      if (detectedSkill) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => {
            if (u.id === activeUser.id) {
              const alreadyHas =
                u.selectedSkills.includes(detectedSkill) ||
                u.derivedSkills.includes(detectedSkill);
              if (!alreadyHas) {
                return {
                  ...u,
                  derivedSkills: [...u.derivedSkills, detectedSkill],
                };
              }
            }
            return u;
          })
        );
      }
    }

    return newListing;
  };

  // === College-Scoped Matching Engine Gate ===

  const findMatchesForListing = React.useCallback(
    async (targetListing: Listing): Promise<Match[]> => {
      setIsMatching(true);
      setActiveListingForMatching((prev) => (prev?.id === targetListing.id ? prev : targetListing));

      try {
        const targetCollegeId = targetListing.collegeId || activeUser?.collegeId || 'college-srm';

        // 1. Resolve Target User's Year (from the selected listing's creator)
        const targetUser = users.find((u) => u.id === targetListing.userId);
        const targetYear = targetUser?.year;

        // 2. STRICT APPLICATION BOUNDARY:
        // - Filter candidates strictly by same collegeId
        // - Exclude target listing and same creator's listings (self-match prevention)
        // - Filter out candidates with yearGap >= 3 (e.g. 1st year ↔ 4th year)
        const eligibleCandidates = listings.filter((candidate) => {
          if (candidate.collegeId !== targetCollegeId) return false;
          if (candidate.id === targetListing.id) return false;
          if (candidate.userId === targetListing.userId) return false;
          if (candidate.status !== ListingStatus.ACTIVE) return false;

          const candidateUser = users.find((u) => u.id === candidate.userId);
          const candidateYear = candidateUser?.year;
          const { isEligible } = evaluateYearCompatibility(targetYear, candidateYear);
          if (!isEligible) return false;

          return true;
        });

        // If zero candidates within the college, return empty without wasting AI tokens
        if (eligibleCandidates.length === 0) {
          setMatches([]);
          return [];
        }

        const response = await fetch('/api/ai/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentListing: targetListing,
            candidateListings: eligibleCandidates,
          }),
        });

        if (!response.ok) {
          throw new Error('Matching API returned error');
        }

        const data = await response.json();
        const resultMatches: Match[] = data.matches || [];
        setMatches(resultMatches);
        return resultMatches;
      } catch (err) {
        console.error('[Store] findMatchesForListing error:', err);
        return [];
      } finally {
        setIsMatching(false);
      }
    },
    [listings, activeUser?.collegeId, activeUser?.id]
  );

  const findExchangeChainsForListing = React.useCallback(
    (targetListing: Listing): ExchangeChain[] => {
      return discoverChains(targetListing, listings, users);
    },
    [listings, users]
  );

  const findMatchabilityRecommendationsForListing = React.useCallback(
    (targetListing: Listing): MatchabilityRecommendation[] => {
      const user = users.find((u) => u.id === targetListing.userId) || activeUser;
      if (!user) return [];
      return findMatchabilityRecommendations(targetListing, user, listings, users);
    },
    [listings, users, activeUser]
  );

  const acceptMatch = (matchId: string): Match | undefined => {
    let updatedMatch: Match | undefined;
    setMatches((prevMatches) =>
      prevMatches.map((m) => {
        if (m.id === matchId) {
          updatedMatch = { ...m, status: MatchStatus.ACCEPTED };
          return updatedMatch;
        }
        return m;
      })
    );
    if (updatedMatch) {
      setSelectedMatch(updatedMatch);
    }
    return updatedMatch;
  };

  const declineMatch = (matchId: string) => {
    setMatches((prevMatches) =>
      prevMatches.map((m) => {
        if (m.id === matchId) {
          return { ...m, status: MatchStatus.DECLINED };
        }
        return m;
      })
    );
  };

  const selectMatch = (match: Match | null) => {
    setSelectedMatch(match);
  };

  // === Exchange Lifecycle Actions ===

  const createOrGetExchange = (match: Match): Exchange => {
    const existing = exchanges.find((e) => e.matchId === match.id);
    if (existing) {
      setActiveExchange(existing);
      return existing;
    }

    const myListing =
      activeListingForMatching || listings.find((l) => l.id === match.listingAId) || listings[0];
    const peerListing = match.peerListing || listings.find((l) => l.id === match.listingBId);

    const initiatorUserId = activeUser?.id || myListing?.userId || 'user_guest';
    const receiverUserId = peerListing?.userId || 'user_peer';

    // HARD SELF-MATCH ACTION GUARD: Block initiating or accepting self-exchange
    if (
      initiatorUserId === receiverUserId ||
      (myListing && peerListing && myListing.userId === peerListing.userId) ||
      match.listingAId === match.listingBId
    ) {
      console.warn('[Exchange Guard] Blocked attempt to start exchange with own listing.');
      throw new Error("You cannot exchange with your own listing.");
    }

    if (match.status !== MatchStatus.ACCEPTED) {
      acceptMatch(match.id);
    }

    const timestamp = new Date().toISOString();
    const exchangeId = `exchange_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newExchange: Exchange = {
      id: exchangeId,
      matchId: match.id,
      initiatorUserId,
      receiverUserId,
      status: ExchangeStatus.INITIATED,
      createdAt: timestamp,
      match,
      myListing,
      peerListing,
    };

    setExchanges((prev) => [newExchange, ...prev]);
    setActiveExchange(newExchange);
    setSelectedMatch(match);

    return newExchange;
  };

  const confirmExchange = (exchangeId: string): Exchange | undefined => {
    const target = exchanges.find((e) => e.id === exchangeId);
    if (!target) return undefined;

    // HARD CONFIRMATION GUARD: Both participants must be different users
    if (target.initiatorUserId === target.receiverUserId) {
      console.warn('[Exchange Guard] Blocked attempt to confirm self-exchange.');
      throw new Error("Cannot confirm an exchange where both participants are the same user.");
    }

    let confirmed: Exchange | undefined;
    setExchanges((prev) =>
      prev.map((ex) => {
        if (ex.id === exchangeId && ex.status === ExchangeStatus.INITIATED) {
          confirmed = {
            ...ex,
            status: ExchangeStatus.CONFIRMED,
            confirmedAt: new Date().toISOString(),
          };
          return confirmed;
        }
        return ex;
      })
    );

    if (confirmed) {
      setActiveExchange(confirmed);
    }
    return confirmed;
  };

  const cancelExchange = (exchangeId: string): Exchange | undefined => {
    let cancelled: Exchange | undefined;
    setExchanges((prev) =>
      prev.map((ex) => {
        if (ex.id === exchangeId && ex.status === ExchangeStatus.INITIATED) {
          cancelled = {
            ...ex,
            status: ExchangeStatus.CANCELLED,
          };
          return cancelled;
        }
        return ex;
      })
    );

    if (cancelled) {
      setActiveExchange(cancelled);
    }
    return cancelled;
  };

  const resetStore = () => {
    setUsers(SEED_USERS);
    setActiveUserId(SEED_USERS[0].id);
    setListings(INITIAL_SEED_LISTINGS);
    setNewlyCreatedId(null);
    setActiveListingForMatching(null);
    setMatches([]);
    setSelectedMatch(null);
    setExchanges(INITIAL_SEED_EXCHANGES);
    setActiveExchange(INITIAL_SEED_EXCHANGES[0]);
  };

  const clearNewlyCreated = () => {
    setNewlyCreatedId(null);
  };

  return (
    <ExchangeStoreContext.Provider
      value={{
        users,
        activeUser,
        colleges: COLLEGES,
        activeCollege,
        onboardingSkills: ONBOARDING_SKILLS,
        login,
        signup,
        logout,
        switchUser,
        searchQuery,
        setSearchQuery,
        listings,
        collegeListings,
        newlyCreatedId,
        activeListingForMatching,
        matches,
        selectedMatch,
        isMatching,
        addListing,
        findMatchesForListing,
        findExchangeChainsForListing,
        findMatchabilityRecommendationsForListing,
        setActiveListingForMatching,
        selectMatch,
        acceptMatch,
        declineMatch,
        exchanges,
        activeExchange,
        createOrGetExchange,
        confirmExchange,
        cancelExchange,
        setActiveExchange,
        resetStore,
        clearNewlyCreated,
      }}
    >
      {children}
    </ExchangeStoreContext.Provider>
  );
}

export function useExchangeStore(): ExchangeStoreContextType {
  const context = useContext(ExchangeStoreContext);
  if (!context) {
    throw new Error('useExchangeStore must be used within an ExchangeStoreProvider');
  }
  return context;
}
