# ARCHITECTURE.md — System Architecture for RExchange

**Project:** RExchange — AI-Powered Campus Exchange Platform  
**Target Timeline:** 5-Hour AI Vibe-Coding Hackathon MVP  
**Status:** Authoritative System Architecture Specification  
**Source of Truth:** Aligned with `PROBLEM_SPEC.md` and governed by `GEMINI.md`  

---

## 1. Architectural Goals

The architecture of RExchange is designed to maximize reliability, clarity, and rapid implementation within a strict 5-hour hackathon window.

1. **Deliver the Complete Core Journey:** Guarantee an unbroken path:  
   `Student Natural Language Input → AI Interpretation → Structured Preview → Reciprocal Match → Match Explanation → Exchange Confirmed`.
2. **5-Hour Time-to-Build Optimization:** Eliminate complex infrastructure, heavy database setups, and speculative microservices.
3. **Strict AI Boundary Separation:** AI functions solely as an interpretation and reasoning engine; application logic deterministically controls validation, state, and persistence.
4. **Unified Creation Flow:** Treat the 7 Categories and 5 Exchange Types as metadata and filtering attributes handled within a single creation workflow.
5. **Cross-Category Reciprocal Discovery:** Ensure the matching pipeline evaluates complementary value across diverse categories (e.g., *Skills & Services ↔ Tech & Electronics*).
6. **Deterministic Fallback Resilience:** Guarantee the application and live demonstration remain 100% functional even if external AI APIs experience latency or errors.
7. **Agent-Friendly Codebase:** Structure code with clean TypeScript interfaces, single-responsibility modules, and predictable state flow for rapid iteration.
8. **Frictionless Vercel Deployment:** Support instant deployment via GitHub to Vercel without requiring complex cloud orchestration.

---

## 2. Technology Stack

| Layer | Selected Technology | Architectural Justification for 5-Hour MVP |
| :--- | :--- | :--- |
| **Development Agent** | **Google Antigravity** | Agentic IDE pairing, workspace awareness, and automated tool execution. |
| **Primary AI Coding Model** | **Gemini 3.5 Flash (Medium)** | Fast token generation, strong coding capability, and low latency during rapid iteration. |
| **Complex Reasoning / Debugging** | **Gemini 3.1 Pro (High)** | High-depth reasoning for complex architectural edge cases or difficult defect diagnostics. |
| **Framework & Runtime** | **Next.js (App Router) + React** | Unified full-stack framework providing server-side API routes, React Server/Client Components, and instant Vercel parity. |
| **Language** | **TypeScript (Strict)** | Static typing guarantees schema integrity between UI, matching logic, and AI response parsers. |
| **Styling & Components** | **Tailwind CSS + shadcn/ui** | Rapid, accessible, high-polish UI composition with distinct Have/Need visual indicators and zero design lock-in. |
| **AI Inference** | **LLM API via Server Boundary** | Secure server-side execution protecting API credentials, validating responses, and formatting prompts. |
| **Data & Persistence** | **Staged: In-Memory / Seed Data (Stage 1)** → **Supabase (Stage 2, if needed)** | Start with deterministic in-memory store and rich realistic seed data for zero-friction demo; upgrade to Supabase only if persistent cross-session storage is required. |
| **Version Control** | **Git + GitHub** | Milestone-driven revision safety and seamless CI/CD integration. |
| **Hosting & CI/CD** | **Vercel** | Zero-configuration serverless deployment with native Next.js optimization and environment secret management. |

---

## 3. High-Level System Architecture

RExchange adopts a clean, layered monolithic architecture within Next.js:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│                 (Next.js App Router, React Components)                 │
│  - Discover Feed & Filters (Categories & Exchange Types)               │
│  - Unified "Have ↔ Need" Smart Creation Interface                      │
│  - Match Results & Reciprocal Match Explainer Cards                    │
│  - Exchange Confirmation & Coordination Handoff View                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Client Actions / API Calls
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION & DOMAIN LAYER                        │
│                 (Next.js Server Actions & Route Handlers)              │
│  - Input Validation & Schema Sanitation (Zod)                          │
│  - Unified Listing State Machine (`active` → `pending` → `confirmed`)  │
│  - Reciprocal Matching Engine & Cross-Category Pair Evaluator          │
│  - Deterministic Fallback Matcher                                      │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐ ┌───────────────────────────────┐
│        PERSISTENCE LAYER             │ │      AI REASONING BOUNDARY    │
│  - Deterministic Seed Dataset        │ │  - Server-Side LLM Gateway    │
│  - In-Memory Exchange Store (Stage 1)│ │  - Natural Language NLP Parser│
│  - Optional Supabase Client (Stage 2)│ │  - AI Reciprocal Match Scorer │
│                                      │ │  - AI Match Rationale Engine  │
└──────────────────────────────────────┘ └───────────────────────────────┘
```

### Core Architecture Principle:
> **AI interprets and ranks; application logic validates and controls state.**  
Under no circumstance does an AI model directly mutate the database, bypass input validation, or transition an exchange's lifecycle state.

---

## 4. End-to-End Application Control Flow

The MVP control flow executes across 10 deterministic steps:

```text
[1. Student Enters Platform]
       │
       ▼
[2. Types Natural-Language Prompt] (e.g., "I can teach Python; need pitch deck design help")
       │
       ▼
[3. Server AI Gateway Invokes NLP Parser] (Extracts Offer, Need, Category, Type, Tags)
       │
       ▼
[4. Application Validates Structured Extraction] (Zod schema validation + fallback defaults)
       │
       ▼
[5. Student Reviews & Confirms Listing Preview] (User edits/approves structured Have/Need card)
       │
       ▼
[6. Listing Persisted to Store] (State initialized as `active`)
       │
       ▼
[7. Reciprocal Matching Engine Queries Candidate Listings] (Cross-category pool evaluation)
       │
       ▼
[8. Compatibility Scoring & Rationale Generation] (Direct & reciprocal pairs ranked with explanations)
       │
       ▼
[9. Student Clicks "Start Exchange"] (Deterministic state transition: `active` → `confirmed`)
       │
       ▼
[10. Exchange Confirmed Screen Rendered] (Displays coordination details and contact handoff)
```

---

## 5. Core Application Modules

The application is decomposed into six cohesive modules:

### 5.1 Discover / Catalog Module (`components/listings`, `lib/data`)
* **Responsibilities:**
  - Renders the active campus marketplace feed.
  - Provides category filtering across all 7 categories.
  - Provides exchange-type filtering across all 5 transaction models.
  - Renders dual-badge listing cards displaying **"OFFERING" (Have)** and **"SEEKING" (Need)** clearly.

### 5.2 Exchange Creation Module (`components/exchange`, `lib/validation`)
* **Responsibilities:**
  - Provides a single, unified creation interface.
  - Accepts free-form natural language input or optional manual adjustments.
  - Dispatches extraction requests to the server AI endpoint.
  - Displays the structured listing preview for user confirmation before publishing.

### 5.3 AI Interpretation Module (`lib/ai`, `app/api/ai/parse`)
* **Responsibilities:**
  - Executes server-side prompts to parse unstructured text.
  - Normalizes semantic entities into: `offer`, `need`, `category`, `exchangeType`, and `tags`.
  - Enforces strict JSON output schema and validates with Zod.
  - Returns safe, typed structured data to the application layer.

### 5.4 Matching Engine Module (`lib/matching`)
* **Responsibilities:**
  - **Deterministic College Boundary Enforcement:** Strictly filters candidate pool by `candidate.collegeId === currentUser.collegeId` BEFORE invoking AI matching. Cross-college candidates are never passed to AI.
  - Scans active listings within the student's college to identify candidate pairings.
  - Evaluates **Bilateral Reciprocal Matches** (`A.Offer == B.Need` AND `B.Offer == A.Need`).
  - Evaluates **Direct 1-Way Matches** (`A.Offer == B.Need` or `B.Offer == A.Need`).
  - Evaluates matches across different categories (Cross-Category Matching within college).
  - Integrates student Capability Profile (selected & derived skills) as supporting context without overriding the primary Have/Need match.
  - Ranks match candidates by compatibility score.

### 5.5 Match Explanation Module (`components/matching`, `lib/ai`)
* **Responsibilities:**
  - Generates clear, human-readable explanations of why two listings complement each other.
  - Visually illustrates the value exchange: "What You Give" ↔ "What You Receive".
  - Displays qualitative compatibility indicators (e.g., "100% Reciprocal Match", "Skill-for-Resource").

### 5.6 Exchange Lifecycle Module (`lib/store`, `components/exchange`)
* **Responsibilities:**
  - Manages deterministic status transitions: `INITIATED` → `CONFIRMED` / `CANCELLED`.
  - Discloses simulated peer contact coordinates (e.g., student campus email/handle) upon confirmation.
  - Updates listing availability in the store.

### 5.7 College-Scoped Access & Capability Profile Subsystem
* **Responsibilities:**
  - **College Isolation:** Enforces campus boundaries at the data layer. A student exclusively discovers and trades with peers in the same college.
  - **Deterministic Eligibility vs AI Compatibility:** Application logic deterministically decides college membership and candidate eligibility. AI is strictly prohibited from authorizing college boundaries.
  - **Capability Profile:** Tracks explicit `selectedSkills` (onboarding) and passive `derivedSkills` (extracted from the user's `HAVE`/`OFFER` listings over time).

```text
COLLEGE-SCOPED MATCHING PIPELINE:
[ Current User (collegeId) ]
           │
           ▼
[ Filter In-Store Listings (candidate.collegeId === currentUser.collegeId) ]
           │
           ▼
[ Exclude User's Own Listings & Inactive Items ]
           │
           ▼
[ Candidate Pool Passed to AI Matching Gateway (/api/ai/match) ]
           │
           ▼
[ AI Semantic Compatibility & Reciprocal Ranking ]
           │
           ▼
[ Reciprocal Match Results & Explanations ]
```


---

## 6. Category & Exchange-Type Architecture

### 6.1 Metadata Classification Model
Categories and Exchange Types are modeled strictly as **metadata attributes**, not divergent workflows or isolated database tables.

```typescript
// Conceptual Taxonomy Definitions (Detailed schemas formalized in DATAMODEL.md)
type Category = 
  | 'Study'
  | 'Tech & Electronics'
  | 'Tickets & Events'
  | 'Skills & Services'
  | 'Opportunities'
  | 'Free / Give Away'
  | 'Other';

type ExchangeType = 
  | 'Swap'
  | 'Skill Exchange'
  | 'Sell'
  | 'Give Away'
  | 'Offer';
```

### 6.2 Unified Workflow Mandate
* **One Single Creation Form:** Every listing—whether swapping a hackathon ticket for a calculator or trading Python tutoring for Figma design—uses the exact same unified interface.
* **Agnostic Matching:** The matching engine does not restrict candidate pairings to the same category. Cross-category trades are evaluated as first-class citizens.

---

## 7. State Management Strategy

To ensure zero runtime overhead and rapid debugging, state is managed using simple, predictable React primitives without external state libraries (no Redux, no Zustand).

### 7.1 State Scopes
1. **Local Component State (`useState`):** UI form inputs, modal visibility, filter pill selection, active tabs.
2. **Application Exchange Context (`React Context`):** In-memory listing catalog, current simulated user session, and active exchange transitions.
3. **Server State:** Handled via Next.js Route Handlers and Server Actions.

### 7.2 Deterministic UI State Machines

```text
Listing Creation State:
[IDLE] ──► [PARSING] ──► [PREVIEW] ──► [CONFIRMED]
   ▲          │             │
   └──────────┴──[ERROR]◄───┘

Matching State:
[IDLE] ──► [SEARCHING] ──► [RESULTS] / [NO_MATCH]
   ▲           │
   └──[ERROR]◄─┘

Exchange Lifecycle State:
[ACTIVE] ──► [CONFIRMED]
   ▲             │
   └──[ERROR]◄───┘
```

---

## 8. Data & Persistence Strategy

A staged persistence strategy guarantees a flawless live demonstration within the 5-hour constraint while preserving an upgrade path.

```text
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS ABSTRACTION                  │
│                     (ExchangeDataStore Interface)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐       ┌──────────────────────┐
│       STAGE 1 (MVP Default)  │       │ STAGE 2 (Optional)   │
│ In-Memory Store + Seed Data  │       │ Supabase PostgreSQL  │
│  - Instant, zero config      │       │  - Persistent across │
│  - Deterministic demo reset  │       │    browsers/sessions │
│  - Sub-millisecond latency   │       │  - Relational tables │
└──────────────────────────────┘       └──────────────────────┘
```

### 8.1 Stage 1: In-Memory Store with Seed Data (Hackathon Core)
* The application initializes with a rich in-memory dataset of realistic campus listings.
* Provides full CRUD, matching, and exchange state transitions in memory.
* Includes an instant "Reset Demo Data" utility to restore initial state at any moment during evaluations.
* Eliminates network database latency, connection drops, and setup overhead.

### 8.2 Stage 2: Supabase Persistence (Progressive Enhancement)
* Abstracted behind an `ExchangeDataStore` interface.
* If persistent multi-device demoing is needed and time permits, Supabase tables can be connected without rewriting UI components or domain services.

---

## 9. Seed Data Architecture

The seed dataset is an essential architectural component that guarantees reliable, zero-friction demonstration.

### Key Pre-Configured Reciprocal Pairs:
1. **Skill ↔ Skill (Cross-Domain):**
   - *User A (Alex M.):* Offers **Python & Backend Tutoring** | Needs **Pitch Deck & UI Design**
   - *User B (Sarah K.):* Offers **Pitch Deck & Figma Design** | Needs **Python CS101 Help**
2. **Resource ↔ Skill (Cross-Category):**
   - *User C (David L.):* Offers **Calculus III Textbook & Notes** | Needs **Machine Learning Project Mentorship**
   - *User D (Elena R.):* Offers **ML Project Mentorship** | Needs **Calculus III Textbook**
3. **Ticket ↔ Tech Gear (Cross-Category):**
   - *User E (Marcus T.):* Offers **Hackathon VIP Pass & Swag** | Needs **TI-84 Graphing Calculator**
   - *User F (Priya S.):* Offers **TI-84 Graphing Calculator** | Needs **Hackathon Pass**
4. **Opportunity ↔ Skill (Cross-Category):**
   - *User G (Jordan P.):* Offers **Robotics Team Lead Spot** | Needs **ROS & C++ Firmware Help**
   - *User H (Liam N.):* Offers **ROS & Embedded C++ Skills** | Needs **Robotics Project Opportunity**

---

## 10. Matching Engine Architecture

The matching architecture processes candidate listings through a multi-stage evaluation pipeline:

```text
[ Active Listing Pool ]
          │
          ▼
[ Stage 1: Basic Deterministic Filtering ]
  - Exclude self-listings
  - Exclude completed/inactive listings
          │
          ▼
[ Stage 2: Compatibility Evaluation ]
  - Evaluate Direct Matches (User A Offer ↔ User B Need)
  - Evaluate Inverse Matches (User B Offer ↔ User A Need)
  - Identify Bilateral Reciprocal Pairs (Both directions satisfied)
          │
          ▼
[ Stage 3: AI Scoring & Semantic Reasoning ]
  - Score semantic alignment (e.g., "Python coding" matches "CS101 tutoring")
  - Generate qualitative score (e.g., 96% Match)
          │
          ▼
[ Stage 4: Match Explanation Synthesis ]
  - Construct human-readable bilateral rationale
          │
          ▼
[ Validated Match Result Delivered to UI ]
```

*Note: The architecture avoids heavy external vector databases (Pinecone/Milvus), executing matching through clean in-memory evaluators combined with targeted LLM reasoning calls.*

---

## 10.1 Exchange Chain Discovery Architecture (Product Differentiation)

### 1. Purpose & Motivation
While direct reciprocal matching (`A ↔ B`) solves two-party barter, value on campus frequently spans three or more students where no bilateral coincidence of wants exists. **Exchange Chain Discovery** enables the system to discover short, closed multi-person exchange loops across campus listings.

### 2. Conceptual Structure & Comparison

```text
DIRECT RECIPROCAL MATCH (Primary):
[Student A] ◄────────────────────────────────────────► [Student B]
  HAVE: Python Tutoring                                  HAVE: Figma Slide Design
  NEED: Figma Slide Design                               NEED: Python Tutoring

3-PERSON EXCHANGE CHAIN (Secondary / Exploratory):
┌────────────────────────────────────────────────────────┐
│ [Student A] (HAVE: TI-84 Calculator | NEED: Python)    │
└───────────────────────────┬────────────────────────────┘
                            │ satisfies B.NEED
                            ▼
┌────────────────────────────────────────────────────────┐
│ [Student B] (HAVE: Python Tutoring | NEED: Figma)      │
└───────────────────────────┬────────────────────────────┘
                            │ satisfies C.NEED
                            ▼
┌────────────────────────────────────────────────────────┐
│ [Student C] (HAVE: Figma Design | NEED: Calculator)    │
└───────────────────────────┬────────────────────────────┘
                            │ satisfies A.NEED
                            ▼
                       [Student A] (Closed Reciprocal Loop)
```

### 3. MVP Scope & Structural Constraints
* **Participant Limit:** Exactly **3 participants** (`A → B → C → A`). Extended chains (4+ participants) are explicitly out of scope for the MVP.
* **Closed-Loop Requirement:** Every edge must represent a valid value transfer:
  - `Edge 1:` `A.offer` satisfies `B.need`
  - `Edge 2:` `B.offer` satisfies `C.need`
  - `Edge 3:` `C.offer` satisfies `A.need`
* **Matching Priority:**
  1. **Direct Reciprocal Matching (`A ↔ B`):** Evaluated and presented first.
  2. **Exchange Chain Discovery (`A → B → C → A`):** Surfaced when direct reciprocal matches are unavailable or weak.

### 4. Hard Application Boundaries & Eligibility
Exchange Chain discovery adheres strictly to the same deterministic rules as direct matching:
1. **College Boundary:** All three participants must share the same `collegeId`. Cross-college chains are strictly prohibited before graph exploration.
2. **Year Proximity Rule:** Pairwise year gaps between participants must satisfy academic proximity (`yearGap < 3`).
3. **Distinct Participants (Self-Match Prevention):** `A.userId !== B.userId`, `B.userId !== C.userId`, and `A.userId !== C.userId`. No student may appear multiple times in a chain.
4. **Active Listing Status:** All participant listings must have `status === ACTIVE`.

### 5. System Responsibilities
* **Application Responsibility:** Deterministically filters eligible candidate listings within the college, extracts candidate graph cycles, enforces self-match and year constraints, and manages chain state.
* **AI Responsibility:** Evaluates semantic edge compatibility (e.g., verifying that "Bioinformatics Python scripts" satisfies "Python tutoring"), synthesizes student-friendly step-by-step chain explanations, and ranks chain plausibility.
* **Safety & Trust Boundary:** Discovering an Exchange Chain represents structural compatibility, **not** an automatic transaction or confirmed exchange. The existing multi-party confirmation lifecycle remains separate.

---

## 10.2 Make Me Matchable Architecture

> **Classification:** Product Differentiation / MVP Interpretation (Intelligent capability recommendation system to overcome barter deadlocks when direct reciprocal matching fails).

### 1. Conceptual Workflow
```text
Student Need
      ↓
Direct Match Search
      ↓
No Strong Match
      ↓
Make Me Matchable
      ↓
Student Capabilities
      +
Eligible Campus Demand
      ↓
Potential Exchange Opportunity
      ↓
Optional Exchange Chain
```

### 2. Architecture & Core Principles
* **Direct Matching Priority:** Direct reciprocal matching (`A ↔ B`) is always evaluated and prioritized first. When direct matches are unavailable or weak, Make Me Matchable assists the student in formulating a viable exchange proposal based on their existing capabilities.
* **Authentic Capability Sources:**
  - **Explicit User Capabilities:** Selected during onboarding (`selectedSkills`).
  - **Extracted Exchange Capabilities:** Derived from the user's previously created listings (`derivedSkills`).
  - **Inferred / AI-Interpreted Capabilities:** Temporary suggestions generated during conversational prompting; never permanently saved to user profile without explicit user confirmation.
* **Eligible Campus Demand:**
  - Aggregated solely from real, active listings (`status === ACTIVE`) within the student's campus community (`collegeId === targetUser.collegeId`).
  - Strict self-match prevention: The student's own active listings are excluded from campus demand counts.
  - Pairwise year proximity: Demand from student listings with `yearGap >= 3` is filtered out before computing viable opportunities.
* **Recommendation Structure & Non-Guarantee:**
  - Recommendations output potential exchange proposals (e.g., *"You could offer Python Tutoring (4 students currently need this in your college). One student offering a TI-84 Calculator is seeking Python tutoring."*).
  - Language is explicitly non-promissory: Presents opportunities, never guaranteed transactions.
* **System Boundaries:**
  - **Application Logic:** Manages identity, college boundaries, year proximity, listing retrieval, candidate filtering, and deterministic demand counting.
  - **AI Reasoning Layer:** Normalizes capability terms, evaluates semantic compatibility between capabilities and student needs, and generates clear, student-friendly match explanations.
  - **Zero Heavy Infrastructure:** Designed to execute in-memory with zero external graph/vector database dependencies for the MVP.

---

## 11. Server-Side AI Gateway Boundary

All AI interactions are mediated through isolated Next.js Server Route Handlers to guarantee security and data integrity.

```text
┌───────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                     │
│  - Submits plain text prompt / match request              │
│  - Receives strictly typed JSON response                  │
│  - Zero exposure of AI API keys                           │
└─────────────────────────────┬─────────────────────────────┘
                              │ HTTPS POST (Internal API)
                              ▼
┌───────────────────────────────────────────────────────────┐
│              SERVER AI GATEWAY (`app/api/ai/*`)           │
│  1. Request rate-limiting & parameter sanitation          │
│  2. Prompt template construction                          │
│  3. LLM API call with temperature = 0.1 (deterministic)   │
│  4. Response schema validation (Zod)                      │
│  5. Error catching & graceful fallback synthesis          │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                      LLM API ENDPOINT                     │
│  (Gemini API / OpenAI-compatible endpoint)                │
└───────────────────────────────────────────────────────────┘
```

---

## 12. AI Failure & Fallback Architecture

To ensure crash-proof demo reliability, the application implements multi-tier graceful degradation:

```text
                       [ AI Request Initiated ]
                                   │
                ┌──────────────────┴──────────────────┐
                ▼                                     ▼
        [ Success (<2.5s) ]                   [ Timeout / Error / Rate Limit ]
                │                                     │
        [ Validate Schema ]                           ▼
         ┌──────┴──────┐                  [ Trigger Deterministic Fallback ]
         ▼             ▼                              │
     [ Valid ]    [ Malformed ]                       ▼
         │             │                1. Preserve user input intact
         │             ▼                2. Extract keywords deterministically
         │       [ Fallback ]           3. Query category/tag exact matches
         ▼             ▼                4. Present friendly "Offline Mode" notice
      [ Render AI Results ]                           │
                                                      ▼
                                         [ Render Deterministic Match ]
```

* **No Synthetic Hallucinations:** When in fallback mode, the system clearly displays matches derived from deterministic rule filters without claiming false AI outputs.

---

## 13. Error Boundaries & Resilience

Errors are strictly isolated to prevent application crashes:

1. **React Component Error Boundary:** Catches unexpected UI rendering faults and displays a clean "Reset View" card.
2. **AI Boundary Handler:** Catches API timeouts, JSON parse errors, and schema mismatches, returning structured fallback payloads.
3. **Store Safety Locks:** Prevents invalid state transitions (e.g., starting an exchange on an already confirmed listing).

---

## 14. Project Directory & Module Organization

Proposed Next.js project structure:

```text
/Users/rudranil/Desktop/ANTIGRAVITY/PROMPTWARS  2026/RExchange/
├── app/
│   ├── layout.tsx                # Root layout & theme providers
│   ├── page.tsx                  # Main exchange workspace (Discover & Post)
│   ├── globals.css               # Tailwind CSS styles
│   └── api/
│       ├── ai/
│       │   ├── parse/route.ts    # NLP listing extraction endpoint
│       │   └── match/route.ts    # AI match reasoning & explanation endpoint
│       └── listings/route.ts     # Listing management endpoint
│
├── components/
│   ├── ui/                       # Reusable primitives (Buttons, Badges, Modals, Cards)
│   ├── listings/                 # Listing cards, Have/Need badges, Category filters
│   ├── exchange/                 # Unified smart creation form, AI preview modal, Confirmation view
│   ├── matching/                 # Reciprocal match cards, Match explanation dialogs
│   └── layout/                   # Navbar, Hero banner, Demo reset toolbar
│
├── lib/
│   ├── ai/                       # AI client, prompt templates, contract schemas
│   ├── matching/                 # Reciprocal matching algorithm & heuristic scorer
│   ├── data/                     # Seed dataset & mock campus records
│   ├── store/                    # In-memory data store & state management
│   ├── validation/               # Zod validation schemas for listings & AI outputs
│   └── utils.ts                  # Shared styling & formatting helpers
│
├── public/                       # Static assets, icons, logos
├── PROBLEM_SPEC.md               # Product & problem source of truth
├── GEMINI.md                     # Engineering & agent behavioral rules
├── ARCHITECTURE.md               # Technical system architecture
├── DATAMODEL.md                  # Schema, entities, and seed definitions (Step 3)
├── AICONTRACT.md                 # AI prompt & schema specifications (Step 4)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.example
```

---

## 15. Environment Variables

Environment variables are partitioned cleanly between server secrets and public client variables:

```bash
# === Server-Side Secrets (Never expose to client or commit to git) ===
AI_API_KEY=your_gemini_api_key_here
AI_MODEL_NAME=gemini-2.5-flash

# === Optional Database (Stage 2 Only) ===
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === Application Configuration ===
NEXT_PUBLIC_CAMPUS_NAME="Metropolis University"
NEXT_PUBLIC_DEMO_MODE=true
```

* `.env.local` contains live credentials and is excluded via `.gitignore`.
* `.env.example` documents all required keys without real secrets.

---

## 16. GitHub & Version Control Strategy

Git is utilized as an incremental safety net with structured milestone commits:

1. `milestone-0-docs`: Project specification, rules, and architecture (`PROBLEM_SPEC.md`, `GEMINI.md`, `ARCHITECTURE.md`, `DATAMODEL.md`, `AICONTRACT.md`).
2. `milestone-1-scaffold`: Next.js base app, Tailwind setup, layout, and seed dataset.
3. `milestone-2-catalog`: Unified listing display, Have/Need badges, and category filtering.
4. `milestone-3-nlp-parser`: Server AI parsing gateway and structured preview modal.
5. `milestone-4-reciprocal-matching`: Cross-category reciprocal matching engine and rationale cards.
6. `milestone-5-exchange-confirmed`: Exchange lifecycle state machine and contact handoff view.
7. `milestone-6-demo-polish`: Sub-60-second demo script hardening, instant reset controls, and visual polish.

---

## 17. Vercel Deployment Architecture

```text
[ Local Development (Antigravity) ]
                │
                ▼ git push origin main
[ GitHub Repository ]
                │
                ▼ Automated Webhook
[ Vercel Build Pipeline ]
  1. `npm run build` (Next.js build & TypeScript verification)
  2. Environment variable injection (`AI_API_KEY`, etc.)
  3. Serverless Route Handler deployment
  4. Global Edge CDN static asset distribution
                │
                ▼
[ Production Deployment (HTTPS URL) ]
```

---

## 18. Security Principles

1. **Zero Secret Leakage:** AI API keys and potential database service keys exist strictly within Node.js server runtimes.
2. **Input Sanitation:** All user-submitted prompts are sanitized and capped in length before passing to AI endpoints.
3. **No False Verification Claims:** The UI clearly represents campus context without claiming unbuilt student identity or biometric verification.

---

## 19. Performance Principles

1. **Sub-100ms UI Transitions:** Optimistic UI state updates ensure the platform feels instantaneous.
2. **Lightweight Bundle Size:** Zero heavy graph libraries, physics engines, or bulky vector packages.
3. **Sub-2s AI Turnaround:** Compact, token-efficient system prompts with explicit JSON schema output.
4. **Deterministic Demo Cache:** Pre-calculated reciprocal matches guarantee instant response during live judge evaluations.

---

## 20. Architectural Decision Rules

When evaluating technical options during the build:
1. **Simplicity First:** Choose the solution with the fewest moving parts.
2. **Native Next.js Primitives:** Prefer built-in Route Handlers and Server Actions over external backend frameworks.
3. **Deterministic Over Probabilistic:** Ensure core app state and transitions are 100% deterministic; use AI strictly for reasoning and interpretation.
4. **Instant Recoverability:** Ensure the demo can be reset to a clean state in under 1 second.

---

## 21. Relationship to Future Project Artifacts

* **`PROBLEM_SPEC.md`:** Defines **WHAT** the problem is and **WHY** RExchange exists.
* **`GEMINI.md`:** Defines **HOW** the AI coding agent must operate and debug.
* **`ARCHITECTURE.md`:** Defines **HOW** the system components are structured and communicate.
* **`DATAMODEL.md` (Next Step):** Will define exact TypeScript interfaces, entity relationships, validation schemas, and concrete seed dataset values.
* **`AICONTRACT.md` (Subsequent Step):** Will define exact system prompts, JSON schemas, input/output contracts, and validation rules for all AI interactions.

---

## 22. Architecture Summary

```text
RExchange Architecture
│
├── Framework: Next.js (App Router) + React + TypeScript
│
├── Presentation Layer
│     ├── Discover Feed (7 Categories, 5 Exchange Types)
│     ├── Unified Have ↔ Need Creation Modal
│     ├── Reciprocal Match Cards & AI Explainer
│     └── Exchange Confirmed State & Contact Handoff
│
├── Application & Domain Layer
│     ├── Unified Listing Flow & Zod Validation
│     ├── Bilateral Reciprocal Matching Engine
│     ├── Cross-Category Evaluation Logic
│     └── Deterministic Exchange State Machine
│
├── AI Reasoning Boundary (Server-Side)
│     ├── Natural Language Listing Parser
│     ├── Reciprocal Match Scorer
│     └── Human-Readable Match Rationale Generator
│
├── Data Layer
│     ├── Stage 1: Rich In-Memory Seed Dataset & Instant Demo Reset
│     └── Stage 2: Abstracted Supabase Persistence (Optional)
│
└── Deployment & CI/CD
      ├── GitHub Milestone Control
      └── Vercel Serverless Hosting
```
