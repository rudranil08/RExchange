# DATAMODEL.md — Data Model Specification for RExchange

**Project:** RExchange — AI-Powered Campus Exchange Platform  
**Target Timeline:** 5-Hour AI Vibe-Coding Hackathon MVP  
**Status:** Authoritative Data Model Specification  
**Source of Truth:** Aligned with `PROBLEM_SPEC.md` and governed by `GEMINI.md` & `ARCHITECTURE.md`  

---

## 1. Data Model Principles

The data model for RExchange is structured around the **"Have ↔ Need"** exchange paradigm. It satisfies five core principles:

1. **Principle 1 — Strict Concept Separation:**  
   `Category`, `Exchange Type`, `Offer`, `Need`, `Listing`, `Match`, and `Exchange` are distinct domain concepts with separate schemas. Under no circumstance are they collapsed into single untyped strings.
2. **Principle 2 — One Unified Listing Model:**  
   All campus assets (textbooks, laptops, event tickets, tutoring, hackathon team openings, donations) use the exact same `Listing` entity. No divergent schemas or table fragments are created for individual categories.
3. **Principle 3 — Cross-Category Matching Support:**  
   The schema permits bilateral compatibility across differing categories (e.g., a *Skills & Services* listing paired with a *Study* or *Tech & Electronics* listing).
4. **Principle 4 — AI Output Validation & Boundary Isolation:**  
   Data generated or extracted by AI models is untrusted until sanitized and validated against application-level schemas before updating state.
5. **Principle 5 — MVP Scope Discipline:**  
   Only fields essential for discovery, filtering, reciprocal matching, match explanation, and exchange confirmation are included. Unnecessary enterprise boilerplate is omitted.

---

## 2. Core Domain Entities

The MVP data model comprises five primary entities:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                                COLLEGE                                 │
│        Represents a campus institution boundary (e.g. VIT Chennai)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : N
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                 USER                                   │
│            Represents a student participating in the exchange          │
│            Includes capability profile: selectedSkills & derivedSkills │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : N
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               LISTING                                  │
│       Represents what a student HAS (Offer) and WANTS (Need)           │
│       Inherits collegeId for deterministic campus scoping             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : N (Candidate Pairs within College)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                MATCH                                   │
│        Represents an evaluated compatibility pair between 2 listings   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 1 : 1
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                               EXCHANGE                                 │
│        Represents the active / confirmed transaction lifecycle         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. `College` Entity

The `College` entity establishes the deterministic boundary for discovery and matching.

| Field Name | Type | Nullable | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` | No | Unique college identifier (e.g., `"college-v"`, `"college-d"`). |
| `name` | `string` | No | Official institution name (e.g., `"VIT Chennai"`, `"Delhi University"`). |

---

## 4. `User` Entity

The `User` entity represents a participating college student.

### Field Definitions

| Field Name | Type | Nullable | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID / CUID) | No | Unique identifier for the student. |
| `email` | `string` | No | Student email or login identifier (e.g., `"alex.m@campus.edu"`). |
| `name` | `string` | No | Full display name (e.g., `"Alex Morgan"`). |
| `collegeId` | `string` | No | Reference to `College.id` establishing the student's campus scope. |
| `course` | `string` | No | Academic major / department (e.g., `"Computer Science"`). |
| `year` | `string` | No | Academic standing (e.g., `"Junior"`). |
| `avatar` | `string` | Yes | URI or avatar badge for visual identity. |
| `contactHandle` | `string` | No | Campus email or handle revealed upon `Exchange Confirmed`. |
| `selectedSkills` | `string[]` | No | Explicit skills chosen during onboarding (e.g., `["Python", "Figma", "Calculus"]`). |
| `derivedSkills` | `string[]` | No | Implicit capability signals extracted from the user's created `HAVE`/`OFFER` listings over time. |
| `createdAt` | `string` (ISO 8601) | No | Timestamp of profile creation. |

---

## 5. `Listing` Entity

The `Listing` is the central unit of value in RExchange, encapsulating both what the student is offering (**Have**) and what they require in return (**Need**), scoped to a specific college.

### Field Definitions

| Field Name | Type | Nullable | Validation & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID / CUID) | No | Unique listing identifier. |
| `userId` | `string` | No | Foreign reference to `User.id` (Creator). |
| `collegeId` | `string` | No | College context (derived from creator's `collegeId`). Used for deterministic candidate filtering. |
| `title` | `string` | No | Concise summary (3–100 chars, e.g., `"Python Tutoring for Pitch Deck Design"`). |
| `description` | `string` | No | Full descriptive context (10–1000 chars). |
| `category` | `Category` (Enum) | No | Discovery metadata category (e.g., `SKILLS_SERVICES`). |
| `exchangeType` | `ExchangeType` (Enum) | No | Transaction model metadata (e.g., `SKILL_EXCHANGE`). |
| `offer` | `string` | No | Explicit value provided by the student (e.g., `"Python programming & data structures tutoring"`). |
| `need` | `string` | No | Explicit value sought in return (e.g., `"Figma UI/UX design for hackathon pitch deck"`). Optional only if `GIVE_AWAY`. |
| `tags` | `string[]` | No | Normalized semantic tags extracted by AI or selected by user. |
| `status` | `ListingStatus` (Enum) | No | Lifecycle status (`ACTIVE`, `PAUSED`, `EXCHANGED`, `ARCHIVED`). Default: `ACTIVE`. |
| `createdAt` | `string` (ISO 8601) | No | Creation timestamp. |
| `updatedAt` | `string` (ISO 8601) | No | Last modification timestamp. |


---

## 5. Category Taxonomy (Enum)

Categories organize catalog browsing, discovery, and manual filtering. A listing belongs to exactly one primary category.

```typescript
export enum Category {
  STUDY = 'STUDY',
  TECH_ELECTRONICS = 'TECH_ELECTRONICS',
  TICKETS_EVENTS = 'TICKETS_EVENTS',
  SKILLS_SERVICES = 'SKILLS_SERVICES',
  OPPORTUNITIES = 'OPPORTUNITIES',
  FREE_GIVEAWAY = 'FREE_GIVEAWAY',
  OTHER = 'OTHER'
}
```

### User-Facing Taxonomy Labels:
* `STUDY` → **"Study"** (Textbooks, notes, calculators, academic guides)
* `TECH_ELECTRONICS` → **"Tech & Electronics"** (Laptops, chargers, monitors, Arduino kits)
* `TICKETS_EVENTS` → **"Tickets & Events"** (Campus fest passes, hackathons, workshops)
* `SKILLS_SERVICES` → **"Skills & Services"** (Coding, design, video editing, peer tutoring)
* `OPPORTUNITIES` → **"Opportunities"** (Project teammates, club positions, research roles)
* `FREE_GIVEAWAY` → **"Free / Give Away"** (Donations, moving-out items, surplus materials)
* `OTHER` → **"Other"** (Dorm essentials, sports equipment, miscellaneous)

*Note: Categories do not constrain reciprocal matching; pairings between different categories are first-class operations.*

---

## 6. Exchange Type Taxonomy (Enum)

Exchange Type is decoupled from Category and represents the transaction mechanic.

```typescript
export enum ExchangeType {
  SWAP = 'SWAP',                     // Physical or digital asset barter
  SKILL_EXCHANGE = 'SKILL_EXCHANGE', // Service-for-service or skill-for-skill trade
  SELL = 'SELL',                     // Monetary transfer requested
  GIVE_AWAY = 'GIVE_AWAY',           // Pure altruistic donation (Need = "None")
  OFFER = 'OFFER'                    // General proposition / open collaboration
}
```

### Examples Illustrating Decoupling:
| Listing Title | Category | Exchange Type | Offer | Need |
| :--- | :--- | :--- | :--- | :--- |
| **Fest Pass for Graphing Calc** | `TICKETS_EVENTS` | `SWAP` | Hackathon VIP Ticket | TI-84 Plus Calculator |
| **Python Help for Slide Deck** | `SKILLS_SERVICES` | `SKILL_EXCHANGE` | Python Tutoring | Pitch Deck Design |
| **Calculus 3 Book for Donation** | `STUDY` | `GIVE_AWAY` | Stewart Calculus 8th Ed | None (Free) |
| **Robotics Firmware Lead** | `OPPORTUNITIES` | `OFFER` | Team Co-Lead Position | Embedded C++ / ROS Skills |

---

## 7. Listing Status (Enum)

```typescript
export enum ListingStatus {
  ACTIVE = 'ACTIVE',       // Available in catalog for discovery & matching
  PAUSED = 'PAUSED',       // Temporarily hidden by creator
  EXCHANGED = 'EXCHANGED', // Successfully fulfilled via an Exchange
  ARCHIVED = 'ARCHIVED'    // Deleted or expired
}
```

---

## 8. Tags Architecture

* **Definition:** An array of lowercase, trimmed string tokens (e.g., `["python", "tutoring", "figma", "ui-ux"]`).
* **Purpose:** Provides normalized semantic hooks for keyword filtering and heuristic scoring.
* **Boundary Principle:** Tags are supporting metadata; the source of truth for exchange semantics resides in the `offer` and `need` text fields.
* **Sanitation:** Tags are limited to 3–8 items per listing, 2–30 characters per tag, lowercase alphanumeric with hyphens.

---

## 9. `Match` Entity

The `Match` entity represents an evaluated compatibility relationship between two distinct listings. **A Match is a suggestion, not an active transaction.**

### Field Definitions

| Field Name | Type | Nullable | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID / CUID) | No | Unique match identifier. |
| `listingAId` | `string` | No | ID of Listing A (Initiating or primary listing). |
| `listingBId` | `string` | No | ID of Listing B (Complementary candidate listing). |
| `score` | `number` (0–100) | No | Compatibility rating generated by scoring engine. |
| `isReciprocal` | `boolean` | No | `true` if bilateral (`A.Offer ↔ B.Need` AND `B.Offer ↔ A.Need`); `false` if 1-way direct. |
| `explanation` | `string` | No | Human-readable explanation of why the match works. |
| `status` | `MatchStatus` (Enum) | No | Lifecycle status (`SUGGESTED`, `ACCEPTED`, `DECLINED`, `EXPIRED`). Default: `SUGGESTED`. |
| `createdAt` | `string` (ISO 8601) | No | Evaluation timestamp. |

---

## 10. Match Score & Explanation

### 10.1 Score Specification
* **Range:** Integer between `0` and `100`.
* **Interpretation:**
  - `90–100`: **Perfect Bilateral Reciprocal Match** (Direct two-way value resolution).
  - `70–89`: **Strong Complementary Match** (High overlap with minor domain difference).
  - `50–69`: **Partial / 1-Way Match** (One party's need is satisfied; other direction is open/flexible).
  - `<50`: Discarded / filtered out from top recommendations.
* **Determinism:** Scores are calculated strictly from listing offer/need attributes and normalized semantic tags.

### 10.2 Explanation Specification
* **Format:** Concise, student-friendly prose (1–3 sentences).
* **Requirements:**
  1. Must explicitly state what User A provides to User B.
  2. Must explicitly state what User B provides to User A (if reciprocal).
  3. Must never fabricate reasons outside the stored listing data.
* **Example:**  
  `"Direct Reciprocal Match: You offer Python tutoring which Sarah needs for CS101, and Sarah offers Figma UI design which solves your hackathon pitch deck need."`

---

## 11. Match Status (Enum)

```typescript
export enum MatchStatus {
  SUGGESTED = 'SUGGESTED', // Presented to student in Match Results UI
  ACCEPTED = 'ACCEPTED',   // Student clicked "Start Exchange"
  DECLINED = 'DECLINED',   // Student dismissed the suggestion
  EXPIRED = 'EXPIRED'      // One of the underlying listings is no longer ACTIVE
}
```

---

## 12. `Exchange` Entity

The `Exchange` entity represents an active or finalized transaction initiated when a student accepts a `Match`.

### Field Definitions

| Field Name | Type | Nullable | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID / CUID) | No | Unique exchange identifier. |
| `matchId` | `string` | No | Foreign reference to `Match.id`. |
| `initiatorUserId` | `string` | No | ID of student who clicked "Start Exchange". |
| `receiverUserId` | `string` | No | ID of student who owns the paired listing. |
| `listingAId` | `string` | No | ID of Initiator's listing. |
| `listingBId` | `string` | No | ID of Receiver's listing. |
| `status` | `ExchangeStatus` (Enum)| No | Lifecycle state (`INITIATED`, `CONFIRMED`, `CANCELLED`). Default: `INITIATED`. |
| `createdAt` | `string` (ISO 8601) | No | Initiation timestamp. |
| `confirmedAt` | `string` (ISO 8601) | Yes | Timestamp when transition to `CONFIRMED` occurred. |

---

## 13. Exchange Status (Enum)

```typescript
export enum ExchangeStatus {
  INITIATED = 'INITIATED', // Exchange started; handoff coordination state rendered
  CONFIRMED = 'CONFIRMED', // Exchange mutually acknowledged / finalized in demo
  CANCELLED = 'CANCELLED'  // Exchange aborted prior to completion
}
```

*Note: In alignment with `PROBLEM_SPEC.md`, this state is labeled **"Exchange Confirmed"**, avoiding any claims of government ID or banking verification.*

---

## 14. `ExchangeChain` Conceptual Entity (Product Differentiation)

The `ExchangeChain` entity represents a derived closed reciprocal loop across multiple listings where no direct two-party match exists.

> **Key Modeling Rule:** An `ExchangeChain` does **NOT** duplicate underlying listing data. It stores an ordered sequence of directed edges linking existing `Listing` and `User` entities within the same college.

### Field Definitions

| Field Name | Type | Nullable | Description & Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `string` (UUID / CUID) | No | Unique chain identifier (e.g., `"chain_01"`). |
| `collegeId` | `string` | No | Campus scope (`College.id`). All participants must share this ID. |
| `participantUserIds` | `string[]` | No | Exactly 3 distinct `User.id` values (`A`, `B`, `C`). |
| `participantListingIds` | `string[]` | No | Exactly 3 distinct `Listing.id` values. |
| `edges` | `ExchangeChainEdge[]` | No | Directed trade edges representing the closed loop. |
| `length` | `number` | No | Length of loop (`3` for MVP). |
| `overallExplanation` | `string` | No | Human-readable explanation of how the 3-way exchange resolves all needs. |
| `status` | `ExchangeChainStatus` | No | Lifecycle status (`DISCOVERED`, `INITIATED`, `CONFIRMED`, `CANCELLED`). |
| `createdAt` | `string` (ISO 8601) | No | Timestamp of chain discovery. |

### `ExchangeChainEdge` Schema

```typescript
export interface ExchangeChainEdge {
  fromListingId: string; // Providing listing
  toListingId: string;   // Receiving listing
  fromUserId: string;    // Value provider
  toUserId: string;      // Value recipient
  providedValue: string; // What is transferred (offer)
  receivedValue: string; // What is satisfied (need)
  explanation?: string;  // Edge-specific semantic compatibility rationale
}

export enum ExchangeChainStatus {
  DISCOVERED = 'DISCOVERED', // Discovered during search
  INITIATED = 'INITIATED',   // Initiator started chain coordination
  CONFIRMED = 'CONFIRMED',   // All 3 participants confirmed
  CANCELLED = 'CANCELLED'    // Aborted prior to completion
}
```

### 14.1 Make Me Matchable Conceptual Entity (Derived Intelligence Layer)

> **Classification:** Derived Recommendation Entity (Computed on-demand from authentic user capabilities and active campus listings).

```typescript
export interface MatchabilityRecommendation {
  id: string;                      // Unique recommendation identifier
  userId: string;                  // Target student identifier
  targetNeed: string;              // What the student is seeking (e.g. "TI-84 Calculator")
  capability: string;              // Recommended offer from user's authentic skills (e.g. "Python Programming Tutoring")
  supportingSource: 'PROFILE_SELECTED' | 'PREVIOUS_EXCHANGE' | 'AI_INFERRED';
  eligibleDemandCount: number;     // Count of active campus listings within the college seeking this capability
  candidateListingIds: string[];   // Specific eligible listing IDs generating the demand
  potentialOpportunityListingId?: string; // Optional listing that simultaneously offers what the user needs
  explanation: string;             // Human-readable guidance rationale
  createdAt: string;               // Generation timestamp
}
```

#### Core Data Invariants:
1. **Derived, Not Stored Truth:** A `MatchabilityRecommendation` is transient guidance; it does not replace or mutate user profile records or listing states.
2. **Grounding Invariant:** `capability` must trace to the user's authentic `selectedSkills` or `derivedSkills` (or explicit user input).
3. **Campus Scoping Invariant:** `candidateListingIds` must all belong to listings where `listing.collegeId === user.collegeId`, `listing.status === ACTIVE`, and `listing.userId !== user.id`.

---

## 15. Relationships & Cardinality

```text
User ──(1:N)── Listing
Listing ──(N:M via Match)── Listing (Direct Reciprocal: A ↔ B)
Listing ──(N:M via ExchangeChain)── Listing (Closed Loop: A → B → C → A)
Listing ──(1:N)── Match (as Listing A or Listing B)
Match ──(1:1)── Exchange
User ──(1:N)── Exchange (as Initiator or Receiver)
```

### Relational Constraints:
1. **Self-Match Prohibition:** A `Match` cannot have `listingAId === listingBId`.
2. **Self-Exchange Prohibition:** An `Exchange` cannot have `initiatorUserId === receiverUserId`.
3. **Foreign Key Integrity:**
   - `Listing.userId` → `User.id`
   - `Match.listingAId` → `Listing.id`
   - `Match.listingBId` → `Listing.id`
   - `Exchange.matchId` → `Match.id`

---

## 15. Validation Rules (TypeScript & Zod Contract)

```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(60),
  course: z.string().min(2).max(60),
  year: z.string().min(1).max(20),
  avatar: z.string().optional(),
  contactHandle: z.string().min(3).max(80),
  createdAt: z.string().datetime()
});

export const ListingSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.nativeEnum(Category),
  exchangeType: z.nativeEnum(ExchangeType),
  offer: z.string().min(3).max(300),
  need: z.string().max(300),
  tags: z.array(z.string().min(2).max(30)).min(1).max(8),
  status: z.nativeEnum(ListingStatus).default(ListingStatus.ACTIVE),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const MatchSchema = z.object({
  id: z.string().min(1),
  listingAId: z.string().min(1),
  listingBId: z.string().min(1),
  score: z.number().int().min(0).max(100),
  isReciprocal: z.boolean(),
  explanation: z.string().min(10).max(500),
  status: z.nativeEnum(MatchStatus).default(MatchStatus.SUGGESTED),
  createdAt: z.string().datetime()
}).refine(data => data.listingAId !== data.listingBId, {
  message: "Listing A and Listing B must be distinct"
});

export const ExchangeSchema = z.object({
  id: z.string().min(1),
  matchId: z.string().min(1),
  initiatorUserId: z.string().min(1),
  receiverUserId: z.string().min(1),
  listingAId: z.string().min(1),
  listingBId: z.string().min(1),
  status: z.nativeEnum(ExchangeStatus).default(ExchangeStatus.INITIATED),
  createdAt: z.string().datetime(),
  confirmedAt: z.string().datetime().optional()
}).refine(data => data.initiatorUserId !== data.receiverUserId, {
  message: "Initiator and Receiver must be different users"
});
```

---

## 16. Deterministic Demo Seed Dataset

The seed dataset contains realistic, high-quality records designed to guarantee an instant, sub-60-second live demonstration.

### 16.1 Seed Users

```typescript
export const SEED_USERS: User[] = [
  {
    id: 'user_alex',
    name: 'Alex Morgan',
    course: 'Computer Science',
    year: 'Junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    contactHandle: 'alex.m@campus.edu',
    createdAt: '2026-08-20T10:00:00Z'
  },
  {
    id: 'user_sarah',
    name: 'Sarah Khan',
    course: 'Digital Media & Design',
    year: 'Sophomore',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    contactHandle: 'sarah.k@campus.edu',
    createdAt: '2026-08-21T11:30:00Z'
  },
  {
    id: 'user_david',
    name: 'David Lee',
    course: 'Mechanical Engineering',
    year: 'Senior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    contactHandle: 'david.lee@campus.edu',
    createdAt: '2026-08-22T09:15:00Z'
  },
  {
    id: 'user_elena',
    name: 'Elena Rostova',
    course: 'Data Science & AI',
    year: 'Graduate',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    contactHandle: 'elena.r@campus.edu',
    createdAt: '2026-08-23T14:20:00Z'
  },
  {
    id: 'user_marcus',
    name: 'Marcus Thorne',
    course: 'Electrical Engineering',
    year: 'Junior',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    contactHandle: 'm.thorne@campus.edu',
    createdAt: '2026-08-24T08:00:00Z'
  },
  {
    id: 'user_priya',
    name: 'Priya Sharma',
    course: 'Mathematics & Stats',
    year: 'Freshman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    contactHandle: 'priya.s@campus.edu',
    createdAt: '2026-08-24T12:00:00Z'
  }
];
```

### 16.2 Seed Listings (With Guaranteed Reciprocal & Cross-Category Pairs)

```typescript
export const SEED_LISTINGS: Listing[] = [
  // Pair 1: Sarah Khan (The counterpart to Alex's prompt in the Demo)
  {
    id: 'listing_sarah_01',
    userId: 'user_sarah',
    title: 'Figma UI/UX Pitch Deck Design for Hackathons',
    description: 'Experienced in Figma & slide decks for campus startups. Looking for a CS peer to help me understand Python backend and recursion for CS101.',
    category: Category.SKILLS_SERVICES,
    exchangeType: ExchangeType.SKILL_EXCHANGE,
    offer: 'High-impact Figma pitch deck and presentation slide design',
    need: 'Python programming fundamentals and CS101 tutoring',
    tags: ['figma', 'design', 'pitch-deck', 'python', 'tutoring', 'ui-ux'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T09:00:00Z',
    updatedAt: '2026-08-24T09:00:00Z'
  },

  // Pair 2: Cross-Category (Study ↔ Skills & Services)
  {
    id: 'listing_david_01',
    userId: 'user_david',
    title: 'Stewart Calculus 8th Edition + Complete Formula Notes',
    description: 'Hardcover textbook in mint condition with my handwritten exam cheat sheets. Want mentorship on training a basic PyTorch model for my senior capstone.',
    category: Category.STUDY,
    exchangeType: ExchangeType.SWAP,
    offer: 'Calculus III textbook and handwritten formula study guides',
    need: 'PyTorch machine learning model setup and mentorship',
    tags: ['calculus', 'textbook', 'study-notes', 'pytorch', 'machine-learning'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T10:15:00Z',
    updatedAt: '2026-08-24T10:15:00Z'
  },
  {
    id: 'listing_elena_01',
    userId: 'user_elena',
    title: 'ML / PyTorch Capstone Project Tutoring',
    description: 'Grad student in AI. Can help you structure and debug your PyTorch deep learning models. In exchange, I need Stewart Calculus textbook for my teaching assistant class.',
    category: Category.SKILLS_SERVICES,
    exchangeType: ExchangeType.SKILL_EXCHANGE,
    offer: 'PyTorch deep learning mentoring and debugging',
    need: 'Stewart Calculus 8th Edition textbook',
    tags: ['pytorch', 'machine-learning', 'tutoring', 'calculus', 'textbook'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T11:00:00Z',
    updatedAt: '2026-08-24T11:00:00Z'
  },

  // Pair 3: Cross-Category (Tickets & Events ↔ Tech & Electronics)
  {
    id: 'listing_marcus_01',
    userId: 'user_marcus',
    title: 'HackCampus VIP Hackathon All-Access Pass',
    description: 'Won an extra team ticket to HackCampus 2026 including hardware lab access. Need a TI-84 Plus CE graphing calculator for my circuits midterm.',
    category: Category.TICKETS_EVENTS,
    exchangeType: ExchangeType.SWAP,
    offer: 'HackCampus 2026 VIP Hackathon Pass & Swag kit',
    need: 'TI-84 Plus Graphing Calculator',
    tags: ['hackathon', 'tickets', 'events', 'calculator', 'hardware'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T13:30:00Z',
    updatedAt: '2026-08-24T13:30:00Z'
  },
  {
    id: 'listing_priya_01',
    userId: 'user_priya',
    title: 'TI-84 Plus CE Graphing Calculator (Like New)',
    description: 'Working TI-84 Plus CE in rose gold with charger. Desperately looking for a pass to the sold-out HackCampus hackathon this weekend.',
    category: Category.TECH_ELECTRONICS,
    exchangeType: ExchangeType.SWAP,
    offer: 'TI-84 Plus CE Graphing Calculator with charger',
    need: 'HackCampus Hackathon ticket pass',
    tags: ['calculator', 'electronics', 'tech', 'hackathon', 'tickets'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T14:45:00Z',
    updatedAt: '2026-08-24T14:45:00Z'
  },

  // Donation / Give Away Example
  {
    id: 'listing_david_02',
    userId: 'user_david',
    title: 'Free Lab Coat & Safety Goggles (Size M)',
    description: 'Graduating this semester, giving away clean chemistry lab coat and ANSI safety goggles to any freshman who needs them.',
    category: Category.FREE_GIVEAWAY,
    exchangeType: ExchangeType.GIVE_AWAY,
    offer: 'Clean chemistry lab coat (Size M) + ANSI Z87 safety goggles',
    need: 'None / Free donation',
    tags: ['lab-coat', 'chemistry', 'free', 'giveaway', 'safety-goggles'],
    status: ListingStatus.ACTIVE,
    createdAt: '2026-08-24T15:00:00Z',
    updatedAt: '2026-08-24T15:00:00Z'
  }
];
```

---

## 17. Campus Context & Location Handling

* **Current MVP Scope:** The application operates within a single campus context. A fixed campus identifier is configured globally via application environment settings (e.g., `NEXT_PUBLIC_CAMPUS_NAME`).
* **Privacy Assurance:** Individual listings and user records **never** capture exact dorm room numbers, GPS coordinates, or private home addresses.
* **Future Scope:** Multi-campus tenant IDs can be added cleanly as an optional `campusId` attribute on `User` and `Listing` without altering the core relational model.

---

## 18. State Transitions & Lifecycle Coordination

```text
Listing Lifecycle:
  [ACTIVE] ────────► [PAUSED] (manual toggle)
     │                  │
     ▼                  ▼
[EXCHANGED] ◄────────[ACTIVE]
     │
     ▼
 [ARCHIVED]

Match Lifecycle:
  [SUGGESTED] ──► [ACCEPTED] ──► Triggers [EXCHANGE: INITIATED]
       │
       ├──► [DECLINED]
       └──► [EXPIRED]

Exchange Lifecycle:
  [INITIATED] ──► [CONFIRMED] ──► Transitions Listings to [EXCHANGED]
       │
       └──► [CANCELLED] ──► Restores Listings to [ACTIVE]
```

### Coordination Invariants:
1. **Match Acceptance:** Transitioning a `Match` to `ACCEPTED` creates an `Exchange` in `INITIATED` status.
2. **Exchange Confirmation:** Transitioning an `Exchange` to `CONFIRMED` updates the underlying listings' status to `EXCHANGED` and reveals contact handles to both parties.
3. **Cancellation:** Cancelling an `Exchange` returns associated listings to `ACTIVE`.

---

## 19. Persistence Layer Mapping

The conceptual entities map seamlessly to both in-memory TypeScript structures and relational SQL tables:

| Conceptual Entity | In-Memory Representation | PostgreSQL / Supabase Table (Stage 2) |
| :--- | :--- | :--- |
| `User` | `interface User` | `users (id, name, course, year, avatar, contact_handle, created_at)` |
| `Listing` | `interface Listing` | `listings (id, user_id, title, description, category, exchange_type, offer, need, tags, status, created_at, updated_at)` |
| `Match` | `interface Match` | `matches (id, listing_a_id, listing_b_id, score, is_reciprocal, explanation, status, created_at)` |
| `Exchange` | `interface Exchange` | `exchanges (id, match_id, initiator_user_id, receiver_user_id, listing_a_id, listing_b_id, status, created_at, confirmed_at)` |

---

## 20. Relationship to Other Artifacts

* **`PROBLEM_SPEC.md`:** Authoritative on user problem, Have ↔ Need paradigm, and product definitions.
* **`GEMINI.md`:** Authoritative on engineering discipline, scope constraints, and debugging rules.
* **`ARCHITECTURE.md`:** Authoritative on layered system design and module boundaries.
* **`DATAMODEL.md` (This Document):** Authoritative on types, schemas, relations, and seed values.
* **`AICONTRACT.md` (Next Step):** Authoritative on LLM prompt inputs, extraction schemas, temperature, and validation parsers.

---

## 21. Open Questions for Final Review

1. **Active Demo User Identity:** In the single-browser demo, should the UI default to `user_alex` with a simple dropdown switcher to view the platform from `user_sarah`'s perspective?  
   *(Decision: Yes, providing a profile switcher in the header enables demonstrating both sides of the trade seamlessly).*
2. **Match Persistence:** Should generated `Match` records be persisted in the store or generated dynamically during the query session?  
   *(Decision: Store matches in memory during the active session to maintain instant rendering and state continuity when starting an exchange).*

---

## 22. Final Data Model Architecture Diagram

```text
                       ┌───────────────────┐
                       │       USER        │
                       │ id, name, course  │
                       └─────────┬─────────┘
                                 │
                            1 : N│ creates
                                 ▼
                       ┌───────────────────┐
                       │      LISTING      │
                       │ offer ◄──► need   │
                       │ category, type    │
                       └────┬─────────┬────┘
                            │         │
                   Listing A│         │Listing B
                            ▼         ▼
                       ┌───────────────────┐
                       │       MATCH       │
                       │ score (0-100)     │
                       │ isReciprocal      │
                       │ explanation       │
                       └─────────┬─────────┘
                                 │
                            1 : 1│ initiates
                                 ▼
                       ┌───────────────────┐
                       │     EXCHANGE      │
                       │ status:           │
                       │ INITIATED/        │
                       │ CONFIRMED         │
                       └───────────────────┘
```
