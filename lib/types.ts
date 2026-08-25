export enum Category {
  STUDY = 'STUDY',
  TECH_ELECTRONICS = 'TECH_ELECTRONICS',
  TICKETS_EVENTS = 'TICKETS_EVENTS',
  SKILLS_SERVICES = 'SKILLS_SERVICES',
  OPPORTUNITIES = 'OPPORTUNITIES',
  FREE_GIVEAWAY = 'FREE_GIVEAWAY',
  OTHER = 'OTHER'
}

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.STUDY]: 'Study',
  [Category.TECH_ELECTRONICS]: 'Tech & Electronics',
  [Category.TICKETS_EVENTS]: 'Tickets & Events',
  [Category.SKILLS_SERVICES]: 'Skills & Services',
  [Category.OPPORTUNITIES]: 'Opportunities',
  [Category.FREE_GIVEAWAY]: 'Free / Give Away',
  [Category.OTHER]: 'Other'
};

export enum ExchangeType {
  SWAP = 'SWAP',
  SKILL_EXCHANGE = 'SKILL_EXCHANGE',
  SELL = 'SELL',
  GIVE_AWAY = 'GIVE_AWAY',
  OFFER = 'OFFER'
}

export const EXCHANGE_TYPE_LABELS: Record<ExchangeType, string> = {
  [ExchangeType.SWAP]: 'Swap',
  [ExchangeType.SKILL_EXCHANGE]: 'Skill Exchange',
  [ExchangeType.SELL]: 'Sell',
  [ExchangeType.GIVE_AWAY]: 'Give Away',
  [ExchangeType.OFFER]: 'Offer'
};

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXCHANGED = 'EXCHANGED',
  ARCHIVED = 'ARCHIVED'
}

export enum MatchStatus {
  SUGGESTED = 'SUGGESTED',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED'
}

export enum ExchangeStatus {
  INITIATED = 'INITIATED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface College {
  id: string;
  name: string;
  domain?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  collegeId: string;
  course: string;
  year: string;
  avatar?: string;
  contactHandle: string;
  selectedSkills: string[];
  derivedSkills: string[];
  createdAt: string;
}

export interface Listing {
  id: string;
  userId: string;
  collegeId: string;
  creatorName?: string;
  creatorContext?: string;
  title: string;
  description: string;
  category: Category;
  exchangeType: ExchangeType;
  offer: string;
  need: string;
  tags: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  listingAId: string;
  listingBId: string;
  score: number;
  explanation: string;
  status: MatchStatus;
  isReciprocal: boolean;
  isCrossCategory?: boolean;
  exchangeSummary?: {
    aGives: string;
    aReceives: string;
  };
  peerListing?: Listing;
  createdAt: string;
}

export interface Exchange {
  id: string;
  matchId: string;
  initiatorUserId: string;
  receiverUserId: string;
  status: ExchangeStatus;
  createdAt: string;
  confirmedAt?: string;
  match?: Match;
  myListing?: Listing;
  peerListing?: Listing;
}

export enum ExchangeChainStatus {
  DISCOVERED = 'DISCOVERED',
  INITIATED = 'INITIATED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED'
}

export interface ExchangeChainEdge {
  fromListingId: string;
  toListingId: string;
  fromUserId: string;
  toUserId: string;
  fromUserName?: string;
  toUserName?: string;
  providedValue: string;
  receivedValue: string;
  explanation?: string;
}

export interface ExchangeChain {
  id: string;
  collegeId: string;
  participantUserIds: string[];
  participantListingIds: string[];
  edges: ExchangeChainEdge[];
  length: number;
  score: number;
  overallExplanation: string;
  status: ExchangeChainStatus;
  createdAt: string;
}

export interface MatchabilityOpportunity {
  listingId: string;
  peerName: string;
  peerContext: string;
  peerOffer: string;
  peerNeed: string;
}

export interface MatchabilityRecommendation {
  id: string;
  userId: string;
  targetNeed: string;
  capability: string;
  eligibleDemandCount: number;
  explanation: string;
  potentialOpportunity?: MatchabilityOpportunity;
  relevanceScore: number;
}


