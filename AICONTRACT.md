# AICONTRACT.md — AI Interface & Reasoning Contract for RExchange

**Project:** RExchange — AI-Powered Campus Exchange Platform  
**Target Timeline:** 5-Hour AI Vibe-Coding Hackathon MVP  
**Contract Version:** `1.0`  
**Status:** Authoritative AI Specification  
**Source of Truth:** Aligned with `PROBLEM_SPEC.md`, `ARCHITECTURE.md`, and `DATAMODEL.md`  

---

## 1. AI Design Principles

The integration of Artificial Intelligence in RExchange is strictly governed by six foundational principles:

1. **Principle 1 — AI Assists; Application Logic Controls:**  
   AI functions exclusively as an interpretation, semantic extraction, and reasoning engine. AI **never** mutates database state, transitions exchange lifecycles, bypasses validation, or grants access.
2. **Principle 2 — Deterministic College Boundary Separation:**  
   College membership and candidate eligibility are enforced **deterministically by application logic before AI evaluation**. The AI engine evaluates semantic compatibility only on pre-filtered candidates belonging to the same college. The AI is strictly prohibited from making college access or authorization decisions.
3. **Principle 3 — Strictly Typed Structured Output:**  
   All AI operations must return schema-compliant JSON payloads. The application validates every response against runtime Zod schemas before ingesting data.
4. **Principle 4 — Grounded Reasoning (Zero Hallucination):**  
   AI reasoning must be strictly grounded in the user's prompt or the supplied listing attributes. The AI must **never** fabricate users, listings, prices, availability, campus opportunities, or transaction histories.
5. **Principle 5 — Cross-Category Value Priority:**  
   Compatibility is evaluated primarily on **Offer ↔ Need** alignment, not on category equality. The AI must never reject or penalize a match simply because the two listings belong to different categories (e.g., *Skills & Services ↔ Tech & Electronics*).
6. **Principle 6 — Capability Profile as Secondary Supporting Context:**  
   The student's capability profile (`selectedSkills`, `derivedSkills`) acts as supporting context. The current listing's explicit `HAVE` ↔ `NEED` alignment remains the primary match criterion. AI extraction never directly mutates the user profile; application logic manages profile updates from validated `HAVE`/`OFFER` signals.


---

## 2. Core AI Operations

The platform defines the following server-isolated AI operations:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PRIMARY AI OPERATIONS                           │
├───────────────────────────────────┬────────────────────────────────────┤
│ Operation A: `extractListing`     │ Converts unstructured student text │
│                                   │ into structured Have ↔ Need fields.│
├───────────────────────────────────┼────────────────────────────────────┤
│ Operation B: `evaluateMatch`      │ Evaluates bilateral compatibility  │
│                                   │ and generates clear match rationale│
├───────────────────────────────────┼────────────────────────────────────┤
│ Operation C: `evaluateExchangeChain`│ Evaluates 3-person closed-loop     │
│ (Product Differentiation)         │ compatibility and generates multi- │
│                                   │ step chain explanation.            │
├───────────────────────────────────┼────────────────────────────────────┤
│ Operation D: `recommendMatchability`│ Evaluates authentic capabilities   │
│ (Product Differentiation)         │ against active campus demand to    │
│                                   │ suggest high-value trade offers.   │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 3. Operation A: `extractListing`

### 3.1 Purpose
Transforms natural-language student prompts (e.g., *"I can teach Python and I need someone to help design my hackathon pitch deck"*) into a structured, validated listing entity.

### 3.2 Conceptual Interpretation Example
* **Raw Prompt:** `"Got a spare TI-84 Plus calculator in great shape, looking for a ticket to the sold-out HackCampus event this weekend."`
* **AI Output:**
  - `title`: `"TI-84 Plus Calculator for HackCampus Pass"`
  - `category`: `TECH_ELECTRONICS`
  - `exchangeType`: `SWAP`
  - `offer`: `"TI-84 Plus Graphing Calculator in great condition"`
  - `need`: `"HackCampus hackathon event ticket pass"`
  - `tags`: `["calculator", "electronics", "hackathon", "ticket", "swap"]`

---

## 4. `extractListing` Input Contract

The client passes user input to the server-side AI gateway.

```typescript
export interface ExtractListingInput {
  /** The raw unstructured text entered by the student */
  text: string;
  /** Approved categories defined in DATAMODEL.md */
  allowedCategories: string[];
  /** Approved exchange types defined in DATAMODEL.md */
  allowedExchangeTypes: string[];
}
```

### Constraints:
* `text` must be a non-empty string (min: 5 chars, max: 1000 chars).
* `allowedCategories` and `allowedExchangeTypes` must be injected server-side from `DATAMODEL.md` enums to prevent prompt drifting.

---

## 5. `extractListing` Output Contract & Status Protocol

```typescript
export type ExtractStatus = 'READY' | 'NEEDS_CLARIFICATION';

export interface ExtractListingResult {
  /** Evaluation status of the extraction */
  status: ExtractStatus;
  /** Concise human-readable title (3-100 chars) */
  title?: string;
  /** Cleaned, normalized description based strictly on user input */
  description?: string;
  /** What the student offers/has (Have) */
  offer?: string;
  /** What the student seeks/wants (Need). Empty only if GIVE_AWAY */
  need?: string;
  /** Category selected from allowedCategories */
  category?: string;
  /** ExchangeType selected from allowedExchangeTypes */
  exchangeType?: string;
  /** 3-8 normalized semantic tags */
  tags?: string[];
  /** Targeted question if input is ambiguous or missing essential information */
  clarificationQuestion?: string;
}
```

---

## 6. Confidence & Insufficient Input Handling

When user input lacks crucial information (e.g., `"I have something cool to trade"`):
1. The AI sets `status: "NEEDS_CLARIFICATION"`.
2. The AI populates `clarificationQuestion` with a friendly, specific prompt (e.g., *"What specific item or skill do you have, and what are you looking for in return?"*).
3. The AI **never** hallucinates a fictional offer or need to force a complete listing.
4. The application displays the clarification question in the UI while preserving the student's original draft.

---

## 7. `extractListing` Validation Schema (Zod)

```typescript
import { z } from 'zod';
import { Category, ExchangeType } from '@/lib/types';

export const ExtractListingResultSchema = z.discriminatedUnion('status', [
  // Success state: Full structured extraction
  z.object({
    status: z.literal('READY'),
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    offer: z.string().min(3).max(300),
    need: z.string().max(300),
    category: z.nativeEnum(Category),
    exchangeType: z.nativeEnum(ExchangeType),
    tags: z.array(z.string().min(2).max(30)).min(1).max(8)
  }),
  // Ambiguous state: Requests clarification without inventing data
  z.object({
    status: z.literal('NEEDS_CLARIFICATION'),
    clarificationQuestion: z.string().min(5).max(300),
    title: z.string().optional(),
    offer: z.string().optional(),
    need: z.string().optional(),
    category: z.nativeEnum(Category).optional(),
    exchangeType: z.nativeEnum(ExchangeType).optional(),
    tags: z.array(z.string()).optional()
  })
]);
```

---

## 8. Operation B: `evaluateMatch`

### 8.1 Purpose
Evaluates two candidate listings to determine whether they form a viable **Bilateral Reciprocal Match** or a **Direct 1-Way Match**, computing a compatibility score and generating a clear human explanation.

### 8.2 Evaluation Dimensions
1. **Direct Compatibility:** Does Listing A's `offer` satisfy Listing B's `need`?
2. **Inverse Compatibility:** Does Listing B's `offer` satisfy Listing A's `need`?
3. **Bilateral Reciprocity:** Both directions satisfied simultaneously.
4. **Cross-Category Compatibility:** Evaluation is category-agnostic.

---

## 9. `evaluateMatch` Input Contract

Only matching-relevant attributes are transmitted to the AI.

```typescript
export interface ListingForMatching {
  id: string;
  title: string;
  category: string;
  exchangeType: string;
  offer: string;
  need: string;
  tags: string[];
  description: string;
}

export interface EvaluateMatchInput {
  listingA: ListingForMatching;
  listingB: ListingForMatching;
}
```

### Data Minimization:
* User IDs, student names, campus emails, avatars, timestamps, and profile metadata are **never** passed to `evaluateMatch`.

---

## 10. `evaluateMatch` Output Contract

```typescript
export type MatchEvaluationStatus = 'MATCH' | 'NO_MATCH';

export interface ExchangeSummary {
  /** Exactly what student A provides to student B */
  studentAGives: string;
  /** Exactly what student A receives from student B */
  studentAReceives: string;
  /** Exactly what student B provides to student A */
  studentBGives: string;
  /** Exactly what student B receives from student A */
  studentBReceives: string;
}

export interface EvaluateMatchResult {
  /** Match determination */
  status: MatchEvaluationStatus;
  /** Compatibility score from 0 to 100 */
  score: number;
  /** True if bilateral (both students satisfy each other's needs) */
  isReciprocal: boolean;
  /** Clear, human-readable rationale (1-3 sentences) */
  explanation: string;
  /** Structured breakdown of the bilateral value exchange */
  exchangeSummary: ExchangeSummary;
}
```

---

## 11. Match Scoring Rules & Priorities

The AI calculates `score` (0–100) using the following priority hierarchy:

1. **Bilateral Reciprocal Need Resolution (Weight: 50%):**  
   Both students directly solve each other's explicitly stated needs.
2. **Semantic Offer/Need Specificity (Weight: 30%):**  
   High relevance between skill/resource depth (e.g., Python CS101 tutoring matches Python programming need).
3. **Tag & Context Overlap (Weight: 20%):**  
   Overlap across domain tags and contextual constraints.
4. **Category Independence:**  
   Cross-category matches (e.g., *Study ↔ Skills & Services*) are evaluated with equal merit to same-category matches. Category differences must **never** result in score penalties.

```text
Score Guide:
  90–100: Perfect Bilateral Reciprocal Match
  70–89:  Strong Complementary Match
  50–69:  Partial / 1-Way Match
  0–49:   NO_MATCH (Discarded)
```

---

## 12. `evaluateMatch` Validation Schema (Zod)

```typescript
export const EvaluateMatchResultSchema = z.object({
  status: z.nativeEnum({ MATCH: 'MATCH', NO_MATCH: 'NO_MATCH' }),
  score: z.number().int().min(0).max(100),
  isReciprocal: z.boolean(),
  explanation: z.string().min(10).max(500),
  exchangeSummary: z.object({
    studentAGives: z.string().min(2).max(200),
    studentAReceives: z.string().min(2).max(200),
    studentBGives: z.string().min(2).max(200),
    studentBReceives: z.string().min(2).max(200)
  })
});
```

---

## 13. Operation C: `evaluateExchangeChain` (Conceptual Contract)

### 13.1 Purpose
Evaluates whether a sequence of 3 distinct, pre-filtered listings from the same college forms a semantically valid closed loop (`A → B → C → A`), and synthesizes clear step-by-step student-readable explanations.

### 13.2 Structural Loop Contract
* **Participant Constraint:** Exactly **3 distinct listings & users** (`A`, `B`, `C`).
* **Edge Requirements:**
  - `Edge 1 (A → B):` `A.offer` semantically satisfies `B.need`.
  - `Edge 2 (B → C):` `B.offer` semantically satisfies `C.need`.
  - `Edge 3 (C → A):` `C.offer` semantically satisfies `A.need`.

### 13.3 Input Contract

```typescript
export interface EvaluateExchangeChainInput {
  collegeId: string;
  listings: [
    { id: string; userId: string; creatorName: string; offer: string; need: string; category: string },
    { id: string; userId: string; creatorName: string; offer: string; need: string; category: string },
    { id: string; userId: string; creatorName: string; offer: string; need: string; category: string }
  ];
}
```

### 13.4 Output Contract

```typescript
export interface EvaluateExchangeChainResult {
  isValidChain: boolean;
  score: number; // 0-100 overall chain compatibility
  edgeExplanations: [
    string, // Why A's offer fulfills B's need
    string, // Why B's offer fulfills C's need
    string  // Why C's offer fulfills A's need
  ];
  overallExplanation: string; // Concise, student-friendly 3-way trade summary
}
```

### 13.5 Strict Safety Boundaries for Exchange Chains
* **Deterministic Eligibility Preserved:** The AI is **never** permitted to evaluate listings across differing colleges or year gaps $\ge 3$.
* **Zero Fabrication:** The AI must only reason about the exact three listings provided.
* **No Automatic Confirmation:** Generating an exchange chain explanation does **not** transition any exchange state.

---

## 13.6 Operation D: `recommendMatchability` (Product Differentiation)

### 13.6.1 Purpose
When direct reciprocal matching fails for a student seeking a resource (e.g. *TI-84 Calculator*), `recommendMatchability` evaluates the student's authentic capabilities (`selectedSkills`, `derivedSkills`) against aggregated active campus demand to suggest high-value trade offers that unblock exchange opportunities.

### 13.6.2 Input Contract
```typescript
export interface CampusDemandSignal {
  capabilityTerm: string;           // Normalized capability (e.g. "Python Tutoring")
  activeDemandCount: number;        // Number of distinct eligible student listings seeking this
  sampleListingTitles: string[];    // Examples of listings seeking this capability
  opportunityListingIds: string[];  // Listing IDs that also offer what the target student needs
}

export interface RecommendMatchabilityInput {
  targetNeed: string;               // What the student is seeking
  userCapabilities: string[];       // Authentic skills from user profile
  collegeId: string;                // Current campus scope
  campusDemands: CampusDemandSignal[]; // Eligible, pre-filtered campus demand signals
}
```

### 13.6.3 Output Contract
```typescript
export interface MatchabilityRecommendationItem {
  capability: string;               // Recommended offer from authentic capabilities
  relevantDemandCount: number;      // Grounded demand count
  explanation: string;              // Student-friendly match rationale
  potentialOpportunitySummary?: string; // Potential reciprocal trade description if available
  relevanceScore: number;           // 0-100 recommendation strength
}

export interface RecommendMatchabilityResult {
  recommendations: MatchabilityRecommendationItem[];
  overallGuidance: string;          // Non-promissory advisory guidance
}
```

### 13.6.4 Strict Safety & Anti-Hallucination Boundaries
1. **Grounded Capabilities:** The AI must **never** recommend skills or goods that the student has not explicitly selected, demonstrated, or provided (`userCapabilities`).
2. **Grounded Campus Demand:** The AI must **never** fabricate demand counts, listing titles, or candidate opportunities outside `campusDemands`.
3. **Deterministic Boundary Adherence:** Application logic filters candidate demand by college (`same-college only`), academic year proximity (`yearGap < 3`), and self-match exclusion **before** calling the AI.
4. **Non-Promissory Output:** Output phrasing must convey potential opportunities (e.g. *"You could offer Python tutoring..."*), never guaranteed transactions or promises.
5. **No Automatic Skill Assignment:** Profile capabilities are never permanently mutated without explicit user confirmation.

---

## 14. Strict Grounding & Anti-Hallucination Rules

The AI model must adhere to these inviolable constraints:

* **[G-01] Zero Information Invention:** Never assume or fabricate details not explicitly stated in the input text or listing attributes.
* **[G-02] Zero Ownership Assumption:** Never assume a student has additional unmentioned goods or skills.
* **[G-03] Zero Pricing / Availability Invention:** Never fabricate prices, fiat valuations, or schedules.
* **[G-04] No State Mutations:** Never claim an exchange is "completed" or "agreed upon". AI outputs are suggestions.
* **[G-05] No Verification Claims:** Never output language claiming users or items are "verified" or "authenticated".
* **[G-06] Closed Taxonomy Adherence:** Never output categories or exchange types outside the provided allowed lists.

---

## 14. AI Failure States & Error Protocol

The application manages 5 standard failure states gracefully:

| Failure State | Trigger Condition | Application Behavior |
| :--- | :--- | :--- |
| `INVALID_INPUT` | Empty, excessively long, or unreadable input text. | Return validation warning to user; prevent API invocation. |
| `AI_UNAVAILABLE` | LLM API network error or invalid API key. | Trigger deterministic fallback matcher; notify user of "Offline Mode". |
| `AI_TIMEOUT` | LLM API exceeds 3000ms response window. | Abort call; switch to deterministic keyword fallback. |
| `INVALID_AI_OUTPUT`| LLM returns malformed JSON or fails Zod schema. | Log error internally; display deterministic extraction fallback. |
| `INSUFFICIENT_INFO` | Model returns `NEEDS_CLARIFICATION`. | Present clarification question in UI; preserve student draft intact. |

---

## 15. Deterministic Fallback Engine Specification

If the AI gateway fails, times out, or is offline, the application invokes a lightweight deterministic fallback engine:

```text
[ Natural Language Text ]
           │
           ▼
[ Fallback Tokenizer ]
  - Filter stop-words
  - Extract candidate keywords as tags
  - Map keywords to Category (e.g., "book" -> STUDY, "python" -> SKILLS_SERVICES)
  - Default exchangeType to SWAP
           │
           ▼
[ Deterministic Reciprocal Candidate Search ]
  - Compute Jaccard tag similarity between Listing A.offer and Listing B.need
  - Compute Jaccard tag similarity between Listing B.offer and Listing A.need
  - If both > 0 -> Reciprocal Match (Score: 85)
  - Generate template rationale: "Listing A matches Listing B's requested needs."
```

*Guarantee: The platform remains 100% demoable and crash-free regardless of external API status.*

---

## 16. Prompt Design Specifications

### 16.1 System Prompt Guidelines for `extractListing`
* **Role:** Expert campus exchange structured parser.
* **Instruction:** Extract `offer`, `need`, `category`, `exchangeType`, `title`, and `tags` strictly from user text. If ambiguous or missing both offer and need, return `status: "NEEDS_CLARIFICATION"`.
* **Output Format:** Strict JSON conforming to `ExtractListingResultSchema`. No markdown wrappers, no prose preamble.
* **Temperature:** `0.1` (Deterministic).

### 16.2 System Prompt Guidelines for `evaluateMatch`
* **Role:** Campus value exchange compatibility evaluator.
* **Instruction:** Compare Listing A and Listing B. Evaluate bilateral compatibility (`A.offer ↔ B.need` and `B.offer ↔ A.need`). Produce `status`, `score`, `isReciprocal`, `explanation`, and `exchangeSummary`.
* **Output Format:** Strict JSON conforming to `EvaluateMatchResultSchema`.
* **Temperature:** `0.1` (Deterministic).

---

## 17. Security & Untrusted Input Isolation

1. **Server-Side Key Isolation:** LLM API keys (`AI_API_KEY`) reside exclusively in Node.js server environments; zero exposure to browser client bundles.
2. **Prompt Injection Mitigation:** User inputs are wrapped in clear XML demarcation tags (`<user_prompt>...</user_prompt>`) with system instructions strictly forbidding execution of user text as system commands.
3. **Schema Sanitization:** All AI outputs pass through Zod parsing; unexpected fields or script tags are stripped before rendering.

---

## 18. AI Integration Contract Examples

### Example 1: Reciprocal Skill Exchange (`evaluateMatch`)
* **Listing A:** `offer`: `"Python & backend tutoring"` | `need`: `"Figma pitch deck design"`
* **Listing B:** `offer`: `"Figma pitch deck design"` | `need`: `"Python CS101 tutoring"`
* **AI Output:**
```json
{
  "status": "MATCH",
  "score": 96,
  "isReciprocal": true,
  "explanation": "Direct Reciprocal Match: You offer Python tutoring which Sarah needs for CS101, and Sarah offers Figma UI design which fulfills your pitch deck need.",
  "exchangeSummary": {
    "studentAGives": "Python programming and backend tutoring",
    "studentAReceives": "Figma pitch deck and presentation design",
    "studentBGives": "Figma pitch deck and presentation design",
    "studentBReceives": "Python programming and CS101 tutoring"
  }
}
```

### Example 2: Cross-Category Trade (`evaluateMatch`)
* **Listing A (Tickets & Events):** `offer`: `"HackCampus VIP Pass"` | `need`: `"TI-84 Graphing Calculator"`
* **Listing B (Tech & Electronics):** `offer`: `"TI-84 Plus Calculator"` | `need`: `"HackCampus Hackathon Pass"`
* **AI Output:**
```json
{
  "status": "MATCH",
  "score": 98,
  "isReciprocal": true,
  "explanation": "Direct Reciprocal Match: You provide the HackCampus VIP pass Marcus needs, while Marcus provides the TI-84 calculator you need for your exams.",
  "exchangeSummary": {
    "studentAGives": "HackCampus 2026 VIP Hackathon Pass",
    "studentAReceives": "TI-84 Plus CE Graphing Calculator",
    "studentBGives": "TI-84 Plus CE Graphing Calculator",
    "studentBReceives": "HackCampus 2026 VIP Hackathon Pass"
  }
}
```

### Example 3: Incompatible Pair (`evaluateMatch`)
* **Listing A:** `offer`: `"Calculus textbook"` | `need`: `"Guitar lessons"`
* **Listing B:** `offer`: `"Chemistry lab coat"` | `need`: `"Monitor stand"`
* **AI Output:**
```json
{
  "status": "NO_MATCH",
  "score": 10,
  "isReciprocal": false,
  "explanation": "No compatible exchange: The offered items and requested needs between these listings have no overlapping utility.",
  "exchangeSummary": {
    "studentAGives": "None",
    "studentAReceives": "None",
    "studentBGives": "None",
    "studentBReceives": "None"
  }
}
```

### Example 4: Ambiguous Input (`extractListing`)
* **User Input:** `"I want to swap some books."`
* **AI Output:**
```json
{
  "status": "NEEDS_CLARIFICATION",
  "clarificationQuestion": "Which specific book titles or subjects are you offering, and which books or materials are you looking for in return?"
}
```

---

## 19. Observability & Logging

Server route handlers log:
* Operation Name (`extractListing` | `evaluateMatch`)
* Status (`SUCCESS` | `FALLBACK_TRIGGERED` | `VALIDATION_FAILED`)
* Latency (`ms`)
* Error Category (if applicable)

*Privacy Rule: User PII, tokens, and raw API keys are excluded from all logs.*

---

## 20. Provider Independence

All AI invocations are abstracted through a unified TypeScript interface:

```typescript
export interface AIServiceProvider {
  extractListing(input: ExtractListingInput): Promise<ExtractListingResult>;
  evaluateMatch(input: EvaluateMatchInput): Promise<EvaluateMatchResult>;
}
```

This interface enables switching between Gemini API, OpenAI-compatible endpoints, or deterministic mock services without touching UI components or business logic.

---

## 21. End-to-End AI Control Flow

```text
                  STUDENT INPUT
                       │
                       ▼
               extractListing()
                       │
                       ▼
              VALIDATED LISTING
                       │
                       ▼
              CANDIDATE LISTINGS
                       │
                       ▼
               evaluateMatch()
                       │
              ┌────────┴────────┐
              ▼                 ▼
           NO_MATCH           MATCH
                                │
                                ▼
                       MATCH EXPLANATION
                                │
                                ▼
                         USER DECISION
                                │
                                ▼
                       APPLICATION STATE
                                │
                                ▼
                       EXCHANGE CONFIRMED
```

---

## 22. Verification Checklist

1. [x] Consistent with `PROBLEM_SPEC.md`, `GEMINI.md`, `ARCHITECTURE.md`, and `DATAMODEL.md`.
2. [x] Defines exactly two primary AI operations: `extractListing` and `evaluateMatch`.
3. [x] Provides strict TypeScript interfaces and Zod schemas.
4. [x] Enforces zero AI control over application state or database persistence.
5. [x] Enforces anti-hallucination and grounded reasoning rules.
6. [x] Supports cross-category reciprocal matching.
7. [x] Defines deterministic fallback for crash-proof demonstrations.
8. [x] Zero application source code, API keys, or SDK packages installed in this step.
