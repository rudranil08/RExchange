# RExchange: Product Specification (PROBLEM_SPEC.md)

**Project:** RExchange — AI-Powered Campus Exchange Platform  
**Target Timeline:** 5-Hour AI Vibe-Coding Hackathon MVP  
**Document Status:** Source of Truth (Pre-Implementation Specification)  
**Last Updated:** August 2026  

---

## 1. Executive Summary

**RExchange** is an AI-powered campus exchange platform designed to unlock latent, unused value within college communities. Unlike conventional classifieds or e-commerce marketplaces focused purely on monetary transactions of physical goods, RExchange operates on a reciprocal **"Have ↔ Need"** exchange model encompassing tangible resources, student services, campus event tickets, academic materials, and academic/career opportunities.

Through natural language understanding and reciprocal matching, RExchange enables students to describe what they can offer and what they require in everyday language, automatically discovering complementary cross-category exchange partners and explaining the mutual benefit of connecting.

---

## 2. Original Problem Statement

> *"Build and deploy a platform that makes it easier for students to exchange resources, services, and opportunities within their college community."*

### Key Mandates from the Problem Statement:
1. **Directly Supported Exchange Types:** The problem statement explicitly mandates enabling exchange across:
   - **Resources** (e.g., physical items, study materials, tech gear)
   - **Services** (e.g., peer tutoring, creative skills, technical assistance)
   - **Opportunities** (e.g., project collaboration, hackathon teams, club openings)
   *(Note: Tickets, event passes, and specific hardware items represent concrete product applications and domain interpretations under these primary asset classes).*
2. **Campus-Centric Context:** Tailored to the peer-to-peer context of a localized college community (without requiring identity verification systems in the MVP).
3. **Friction Reduction:** Dramatically simplify the process of publishing, discovering, and finalizing exchanges compared to fragmented channels.

---

## 3. Product Concept & Core Product Loop

### 3.1 The Fundamental Problem
**Unused value exists in high concentration within every college campus, but students lack an efficient, structured mechanism to discover, match, and exchange that value with peers who need it.**

Students frequently possess spare skills, surplus equipment, event passes, or academic notes, while simultaneously needing academic tutoring, project collaborators, presentation design, or specific hardware. Because existing tools require manual searching through unindexed text feeds, most potential mutual exchanges are never realized.

### 3.2 The Core Product Loop

```
[ Student Enters Platform ]
            │
            ▼
[ Describes Offer & Need in Natural Language ]
  (e.g., "I can teach Python; need pitch deck design help")
            │
            ▼
[ AI Parser Extracts Structured Exchange Intent ]
  (Offer: Python Tutoring | Need: Deck Design | Cat: Skills & Services)
            │
            ▼
[ Reciprocal Matching Engine Discovers Bilateral Matches ]
  (Finds Peer: Offers Deck Design | Needs Python Tutoring)
            │
            ▼
[ System Generates Transparent Match Explanation ]
  ("Direct Reciprocal Match: Solves your design need in exchange for your coding skill")
            │
            ▼
[ Student Initiates Exchange → Exchange Confirmed State ]
```

---

## 4. Core Product Model: The "Have ↔ Need" Framework

Traditional marketplaces are organized around unidirectional sale listings (`Item for Sale -> Price`). RExchange models campus interactions as **multilateral value exchanges**:

* Every listing establishes a bilateral relationship:
  - **What the student HAS / OFFERS** (Value Provider)
  - **What the student WANTS / NEEDS** (Value Seeker)
* **Cross-Category Value Exchange:** A student offering a service (e.g., Python tutoring) can exchange with a student offering a resource (e.g., a textbook or calculator) or a complementary service (e.g., UI/UX design). Categories exist for filtering and discovery, but **do not constrain matching**.

### Examples of Valid Value Exchanges:
| Offer (Have) | Need (Want) | Category Alignment | Exchange Dynamic |
| :--- | :--- | :--- | :--- |
| Textbook (Calculus III) | Python Tutoring | Study ↔ Skills & Services | Cross-Category Swap |
| UI/UX Presentation Design | Python / Backend Help | Skills & Services ↔ Skills & Services | Skill Exchange |
| Hackathon Ticket Pass | Graphing Calculator | Tickets & Events ↔ Tech & Electronics | Cross-Category Swap |
| Unused Arduino Kit | Free / Give Away | Tech & Electronics ↔ Free | Direct Give Away |
| Competitive Programming Mentorship | ML Research Project Teammate | Skills & Services ↔ Opportunities | Opportunity / Service Match |

---

## 5. Category Taxonomy

Categories organize catalog discovery, browsing, and manual filtering. A listing must belong to one primary category, but AI matching operates agnostically across all categories.

**Important:** Categories are metadata and discovery filters, **not separate workflows**. The application provides a single unified creation flow for all categories.

| # | Category | Scope & Example Items |
| :--- | :--- | :--- |
| **1** | **Study** | Textbooks, handwritten/digital notes, study guides, scientific calculators, lab coats, academic equipment. |
| **2** | **Tech & Electronics** | Laptops, chargers, USB-C hubs, monitors, Arduino/Raspberry Pi kits, cables, PC accessories, components. |
| **3** | **Tickets & Events** | College fest passes, hackathon tickets, workshop passes, conference registrations, sports tournament access. |
| **4** | **Skills & Services** | Peer tutoring (STEM/humanities), programming help, graphic design, video editing, photography, resume critique, music lessons. |
| **5** | **Opportunities** | Hackathon team recruitment, research lab openings, startup co-founders, project collaboration, club committee roles, study groups. |
| **6** | **Free / Give Away** | Donated stationery, moving-out furniture, surplus materials, free textbook PDFs, leftover event swag. |
| **7** | **Other** | Miscellaneous items, dorm essentials, sports equipment, non-standard student exchanges. |

---

## 6. Exchange Type Taxonomy & Unified Creation Flow

**Exchange Type** is decoupled from **Category**. A listing in any category can adopt any appropriate exchange type:

* **Swap:** Bilateral exchange of physical or digital assets (e.g., Book A for Book B, Ticket for Hardware).
* **Skill Exchange:** Direct service-for-service or skill-for-skill trade (e.g., Math Tutoring for Design).
* **Sell:** Monetary exchange where a student requests cash/digital transfer for a resource or ticket.
* **Give Away:** Altruistic transfer without expected reciprocation (Need is empty or specified as "None / Free").
* **Offer:** General service or opportunity proposition looking for project collaboration or open compensation.

### 6.1 Unified Exchange Creation Flow
Categories and exchange types are metadata and classification attributes, not separate forms or divergent workflows. The MVP uses **one single, unified exchange creation flow** across all combinations.

For example, both of the following use the identical creation interface and data model:
* **Example A (Tickets / Swap):**  
  Category: *Tickets & Events* | Exchange Type: *Swap* | Offer: *Hackathon ticket* | Need: *Calculator*
* **Example B (Skills / Skill Exchange):**  
  Category: *Skills & Services* | Exchange Type: *Skill Exchange* | Offer: *Python tutoring* | Need: *Presentation design*

### 6.2 Structured Listing Conceptual Model
A listing strictly captures:
1. **Title & Description:** Detailed contextual information.
2. **Category:** Discovery grouping (e.g., *Skills & Services*).
3. **Exchange Type:** Transaction model (e.g., *Skill Exchange*).
4. **Offer (Have):** Exact description of the value provided.
5. **Need (Want):** Exact description of the value expected in return.
6. **Tags:** Extracted semantic identifiers (e.g., `["python", "tutoring", "ui/ux"]`).
7. **Creator & Status:** User reference and lifecycle state (`active`, `pending`, `confirmed`, `cancelled`).

---

## 7. AI Role, Responsibilities & Boundary Architecture

AI serves as an intelligent reasoning and interpretation layer, but does **not** manage application business logic or state machines.

```
┌─────────────────────────────────────────────────────────────┐
│                       USER INTERFACE                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐
│   APPLICATION LOGIC   │             │   AI REASONING LAYER  │
│  (State, Validation,  │             │   (NLP Parser, Ranker,│
│  Filtering, Storage)  │             │    Match Explainer)   │
└───────────┬───────────┘             └───────────┬───────────┘
            │                                     │
            └──────────────────┬──────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 PERSISTENT EXCHANGE SYSTEM                  │
└─────────────────────────────────────────────────────────────┘
```

### 7.1 Key AI Responsibilities (What the AI Must Accomplish)
1. **Natural Language Listing Parsing:**
   - Interprets unstructured student prompts (e.g., *"Got a spare 60W Apple charger, desperately looking for someone to review my machine learning project resume"*).
   - Extracts: `Offer`, `Need`, recommended `Category`, recommended `Exchange Type`, and normalized semantic `Tags`.
2. **Reciprocal Match Discovery & Scoring:**
   - Identifies candidate pairings where complementary value exists: Student A offers what Student B needs AND Student B offers what Student A needs.
   - Evaluates match relevance across categories (cross-category matching).
   - Produces a clear compatibility score for ranked presentation.
3. **Match Explanation Generation:**
   - Produces transparent, human-readable rationales explaining why the match is mutually beneficial (e.g., *"Strong Reciprocal Match: You offer Python tutoring which Alex needs for CS101, while Alex offers Figma UI design which solves your hackathon pitch deck need."*).

*(Note: Concrete algorithmic mechanics and prompt schemas will be specified in `ARCHITECTURE.md` and `AICONTRACT.md`).*

### 7.2 Strict AI Safety & System Boundaries
* **No Synthetic Data Creation:** AI must **never** hallucinate listings, invent fake users, alter prices, create false availability, or forge transaction histories.
* **Deterministic Application Control:** The application logic handles validation, database persistence, state transitions (`active` → `in_exchange` → `confirmed`), and contact coordinate display.
* **Fallback Behavior:** If the AI service is unavailable or latency is high, deterministic category and keyword filtering ensures continuous platform functionality.

---

## 8. In-Depth Problem Analysis

### 8.1 The Problem in Simple Student Language
> *"You have an extra ticket to the college fest and you're great at Python, but your calculator broke and you need help designing slides for tomorrow's competition. Right now, your only option is spamming 10 WhatsApp groups where your message gets buried in 3 minutes, or checking Instagram stories that disappear. Nobody knows who has what, or who needs what."*

### 8.2 Real-World Systemic Friction
1. **High Information Decay:** Chat messages in group chats (WhatsApp/Telegram) have an active lifespan of under 15 minutes before being pushed off-screen.
2. **Unstructured Search Deficit:** Chat apps lack structured query filters (e.g., searching for "Calculus book available for trade with Graphic Design").
3. **Asymmetric Value Discovery:** Existing bulletin boards only allow one-way posts ("Selling X"). They do not facilitate barter, skill swaps, or reciprocal need fulfillment.
4. **Context & Friction:** Generic online classifieds (Craigslist, OLX, Facebook Marketplace) lack campus context, local proximity, and student focus.

### 8.3 Target Users
* **Primary Target:** Undergraduate and graduate college students living on or commuting to campus.
* **User Personas:**
  - *The Skill-Rich / Cash-Strapped Student:* Has coding or design ability; needs course textbooks or tutoring in another subject.
  - *The Event Attendee:* Possesses extra hackathon/fest tickets or passes; seeks project teammates or materials.
  - *The Graduating / Moving Student:* Has surplus dorm electronics, notes, and lab gear; wants to give away or swap for quick favors.

### 8.4 Competitive Analysis of Existing Alternatives

| Existing Channel | Discovery Quality | Reciprocal Matching | Multi-Category Support | Primary Failure Mode |
| :--- | :--- | :--- | :--- | :--- |
| **WhatsApp / Telegram Groups** | Very Low (Ephemeral stream) | None (Manual scrolling) | High but chaotic | Message deluge, noise, zero indexing. |
| **College Notice Boards** | Low (Physical / Static) | None | Limited to physical items | Zero searchability, low student engagement. |
| **Instagram Stories / Socials** | Low (Disappears in 24h) | None | Low | Audience limited to personal followers. |
| **Generic Classifieds (OLX/FB)** | Medium (Searchable) | None (Sell only) | Poor student service fit | Strangers, safety concerns, lack of campus context. |
| **Informal Friend Networks** | High Familiarity, Zero Reach | Manual / Serendipity | Limited to immediate circle | Fails to reach 99% of campus peers. |

---

## 9. Requirements Extraction

### 9.1 Requirements Directly Supported by the Problem Statement
* [EXP-01] Build a functional platform enabling students to exchange **resources** within their college community.
* [EXP-02] Support student exchange of **services and skills**.
* [EXP-03] Support student exchange of **opportunities** (collaborations, teams, projects).
* [EXP-04] Facilitate exchanges specifically within a **college/campus community** context.
* [EXP-05] Provide mechanisms to make the exchange discovery and initiation process significantly **easier and more efficient**.

### 9.2 Implicit Requirements & Domain Interpretations
* [IMP-01] Support concrete campus exchange subtypes such as academic materials, tickets/event passes, tech accessories, and project roles under the primary asset categories.
* [IMP-02] Structured listing representation that clearly separates what is offered from what is needed (Have ↔ Need model).
* [IMP-03] Unified categorization and exchange-type metadata scheme to organize discovery without fragmenting user flows.
* [IMP-04] Reciprocal match discovery mechanism capable of identifying bidirectional alignment across offers and needs.
* [IMP-05] Clear listing lifecycle status (`active`, `pending`, `confirmed`) without requiring transactional/identity verification systems in the MVP.
* [IMP-06] Search and filter controls for manual browsing alongside AI matching.

### 9.3 User Needs
* [USR-01] Quick, low-friction listing creation (typing natural sentences instead of filling long bureaucratic forms).
* [USR-02] Immediate visibility into whether someone on campus has what they need or wants what they offer.
* [USR-03] Clear explanations for why a suggested match is relevant.
* [USR-04] Direct action to initiate an exchange with a matched peer.

### 9.4 Functional Requirements
* [FR-01] **Unified Listing Creation Engine:** Single entry flow accepting `Offer`, `Need`, `Category`, `Exchange Type`, and `Description`.
* [FR-02] **AI Natural Language Extraction:** Parser converting free-form text into structured listing parameters.
* [FR-03] **Catalog & Category Filter:** Browse listings filtered by 7 categories and 5 exchange types.
* [FR-04] **Reciprocal Matching Engine:** Mechanism evaluating listings to surface complementary pairs (`A.Offer == B.Need` && `B.Offer == A.Need`).
* [FR-05] **Match Explanation UI:** Visual cards detailing reciprocal value alignment and score.
* [FR-06] **Exchange Flow Initiation:** One-click action to request and transition to an `Exchange Confirmed` state between matched parties.
* [FR-07] **Demo Seed Dataset:** Pre-populated realistic campus listings spanning all categories to showcase instant matching.

### 9.5 UX Requirements
* [UX-01] Clean, modern, responsive campus-first interface.
* [UX-02] Dual-view listing cards displaying both "OFFERING" and "SEEKING" badges clearly.
* [UX-03] Interactive "AI Magic Matcher" modal or panel where students test free-form inputs.
* [UX-04] Visual match indicators (e.g., "Reciprocal Match", "Skill-for-Skill", "Resource-for-Service").
* [UX-05] Frictionless 1-click transition to confirmed exchange states for demo demonstration.

### 9.6 Technical & System Requirements (MVP Scoped)
* [TR-01] Fast client-side and server-side execution without heavyweight infrastructure overhead.
* [TR-02] Resilient matching capability with deterministic fallback if external AI latency spikes.
* [TR-03] Reliable data persistence for listings and exchange statuses for the duration of the demonstration.
* [TR-04] Single-command local startup and build reproducibility.

### 9.7 Constraints
* [CON-01] **5-Hour Total Build Window:** Every architectural and design decision must favor simplicity, reliability, and completion over feature sprawl.
* [CON-02] **Single Campus Scope:** Assume a single shared college community context; omit multi-tenant multi-university architecture.
* [CON-03] **Zero Payment Gateway Dependencies:** Omit third-party payment gateways (Stripe, Razorpay) to eliminate external failure points.
* [CON-04] **No Identity / Trust Verification Systems:** The MVP does not implement student ID card verification, SSO/LDAP authentication, or background checking.

### 9.8 Success Criteria
* [SC-01] A judge or student can test the core journey in **under 60 seconds**.
* [SC-02] Natural language input accurately extracts Offer, Need, Category, and Exchange Type.
* [SC-03] Reciprocal matching correctly pairs cross-category listings (e.g., Python tutoring ↔ Deck design) with full human-readable rationale.
* [SC-04] The exchange workflow terminates in a clear, unambiguous confirmation state (**Exchange Confirmed**).

---

## 10. Requirement → Feature Traceability Matrix

| Problem Requirement | Source & Classification | RExchange Platform Feature | Verification Method |
| :--- | :--- | :--- | :--- |
| **Exchange Resources** | Problem Statement (Direct) | *Study* & *Tech & Electronics* categories; physical item listings. | Browse & create textbook / calculator exchange. |
| **Exchange Services** | Problem Statement (Direct) | *Skills & Services* category; *Skill Exchange* type. | Pair tutoring with graphic design. |
| **Exchange Opportunities** | Problem Statement (Direct) | *Opportunities* category; hackathon team / project matching. | Create project collaborator listing. |
| **Exchange Tickets / Passes** | Domain Interpretation (under Resources/Opportunities) | *Tickets & Events* category; event pass swap/transfer. | List extra fest ticket for study notes. |
| **Make Exchange Easier** | Problem Statement (Direct) | Natural Language AI Parser (`"I have X, need Y"` to structured card). | Paste unstructured paragraph into AI box. |
| **Discover Complementary Value** | Product Concept (Core Solution) | Reciprocal Matching Algorithm (Have ↔ Need bilateral match). | Trigger matcher on complementary seeds. |
| **Explain Match Relevance** | Product Concept (AI Role) | AI Match Explainer component showing structured rationale. | Inspect match explanation card text. |
| **Cross-Category Trades** | Product Concept (Core Differentiator) | Cross-category matching engine (Skills ↔ Resources). | Verify match between coding tutor and textbook owner. |
| **Campus Community Focus** | Problem Statement (Direct) | Campus-tailored categories, student badges, and exchange flows. | Review sample listings and terminology. |

---

## 11. End-to-End User Journey (The 10-Step MVP Flow)

```
Step 1: Student opens RExchange (views curated campus feed of active opportunities & resources).
   │
Step 2: Student clicks "Create Exchange" / "AI Smart Post".
   │
Step 3: Student inputs natural text: "I can teach Python and I need someone to help design my hackathon pitch deck."
   │
Step 4: RExchange AI interprets the prompt in real-time.
   │
Step 5: Student reviews structured preview:
        - Category: Skills & Services
        - Exchange Type: Skill Exchange
        - Offer: Python Tutoring
        - Need: Presentation / Pitch Deck Design
        - Tags: [Python, Tutoring, Design, PitchDeck, Hackathon]
   │
Step 6: Student confirms listing and clicks "Find Reciprocal Matches".
   │
Step 7: RExchange scans campus listings and surfaces Top Match:
        - Peer: "Sarah K." (Offers Figma Pitch Deck Design | Needs CS101 Python Tutoring)
        - Match Quality: 96% Bilateral Reciprocal
   │
Step 8: System presents Match Explanation:
        "Direct Bilateral Match: You solve Sarah's Python tutoring requirement, and Sarah fulfills your hackathon presentation design need."
   │
Step 9: Student clicks "Start Exchange".
   │
Step 10: Platform transitions to "Exchange Confirmed" state with clear contact/coordination handoff instructions.
```

---

## 12. MVP Prioritization (MoSCoW Framework)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MUST HAVE (5-Hour MVP Core)                     │
│  - Have ↔ Need Listing Model (Offer, Need, Category, Type)             │
│  - Natural Language Listing Extraction AI                              │
│  - 7 Standard Categories & 5 Exchange Types (Metadata in Unified Flow) │
│  - Bilateral Reciprocal Matching Engine                                │
│  - Transparent AI Match Explanations                                   │
│  - Direct "Start Exchange" → "Exchange Confirmed" State Flow           │
│  - Seeded Realistic Campus Listings (Resources, Skills, Tickets, Opps) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                        SHOULD HAVE (If Time Permits)                   │
│  - Quick Filter Pills by Category and Exchange Type                    │
│  - Keyword Search Bar for Manual Catalog Exploration                   │
│  - One-Way Partial Match Display (Offer matches Need, but not vice-ver)│
│  - Demo Reset Button (restores seed dataset instantly)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                        NICE TO HAVE (Post-MVP Polish)                  │
│  - Multi-Item Bundle Swaps (2 items for 1 service)                     │
│  - Simulated In-App Chat Direct Messaging Modal                        │
│  - Campus Community Badge Mockup                                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                    EXPLICITLY OUT OF SCOPE (Anti-Scope Creep)          │
│  - Real Payment Gateways / Banking APIs                                │
│  - Production SMS/OAuth/Multi-factor Auth / Identity Verification      │
│  - Heavy Vector Database Infrastructure                                │
│  - Geolocation Map GPS Tracking                                        │
│  - Multi-University Tenant Switching                                   │
│  - Long-term Review / Escrow Dispute System                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Strategic & Competitive Differentiation

| **Community Scope** | Open internet (High risk) | Closed but chaotic | **Campus-Centric Student Community** |

### 13.1 Product Differentiation / MVP Interpretation: Exchange Chains

> **Classification:** Product Differentiation / MVP Interpretation (Conceptual extension of multi-asset campus exchange, not an explicit requirement of the original problem statement).

#### The Core Problem of Direct Barter:
Direct reciprocal matching (`A ↔ B`) requires a strict "double coincidence of wants" (Student A has what Student B needs, AND Student B has what Student A needs). On a college campus, many valuable trades are deadlocked because Student A has what Student B needs, but Student B has a skill or item needed by Student C, who in turn has what Student A needs.

#### Product Definition:
**Exchange Chain** is an intelligent capability that discovers closed multi-person exchange loops across campus listings.

* **Primary vs. Chain Priority:**
  1. **Direct Reciprocal Match (`A ↔ B`):** Remains the primary, simplest, and preferred exchange path.
  2. **Exchange Chain (`A → B → C → A`):** Surfaced when direct reciprocal matches are unavailable or weak.
* **MVP Scope Constraint:** Exactly **3 participants** (`A → B → C → A`). Closed loops only.
* **Deterministic Boundary Enforcement:** All participants in an Exchange Chain must belong to the same college, satisfy academic year compatibility, and be distinct students (zero self-matches).

### 13.2 Product Differentiation / MVP Interpretation: Make Me Matchable

> **Classification:** Product Differentiation / MVP Interpretation (Conceptual recommendation capability designed to unblock barter deadlocks when direct reciprocal matching fails; not an explicit requirement of the original problem statement).

#### The Asymmetric Barter Deadlock:
A student frequently needs a specific campus resource or skill (e.g., a *TI-84 Calculator* or *PyTorch mentorship*) but currently offers nothing that the resource owner wants, creating a dead-end search.

#### Product Definition:
**Make Me Matchable** is an intelligent capability that answers: *"What could I offer from my existing skills and capabilities that students on my campus actually need right now?"*

* **Core Operational Pipeline:**
  1. Identifies the student's desired need and their authentic capabilities (`selectedSkills` + `derivedSkills`).
  2. Aggregates real, active demand across eligible listings within the student's college.
  3. Recommends viable offers that have existing campus demand and high probability of creating direct trades or unlocking exchange chains.
* **Matching & Discovery Hierarchy:**
  1. **Direct Reciprocal Match (`A ↔ B`):** Primary path.
  2. **Make Me Matchable Recommendations:** Surfaced when direct reciprocal matches are absent or weak to propose high-value trade offers.
  3. **Exchange Chain Discovery (`A → B → C → A`):** Surfaced to discover multi-party closed loops.
* **Safety & Integrity Invariants:**
  - **No Value Fabrication:** Only suggests capabilities grounded in the student's profile and real campus listings.
  - **Hard Boundaries:** Recommendations strictly originate from the student's same college and respect year proximity rules.
  - **Non-Guarantee:** Recommendations represent potential exchange opportunities, not guaranteed transactions.
  - **No Automatic Skill Assignment:** Profile capabilities are never permanently modified without explicit user confirmation.

---

## 14. Demo Strategy: The Sub-60-Second "Wow Moment"

### Demonstration Script & Flow:
1. **The Hook (0–15s):**  
   Presenter introduces RExchange: *"Students have skills, notes, and gear, but lack cash and a way to trade them. Watch what happens when we describe an exchange in plain English."*
2. **The Natural Language Input (15–30s):**  
   Presenter clicks "AI Exchange" and types/selects:  
   `"I can teach Python programming and I need someone to help design my hackathon pitch deck."`  
   AI instantly parses and populates the structured Have/Need card.
3. **The Reciprocal Match Discovery (30–45s):**  
   Presenter clicks "Find Matches". System instantly highlights a peer offering Presentation Design and needing Python Tutoring.  
   The card displays:
   - **Match Score: 98% (Reciprocal Match)**
   - **Why It Works:** *"You offer Python tutoring (which Alex needs), and Alex offers Figma Pitch Deck Design (which you need)."*
4. **The Resolution (45–60s):**  
   Presenter clicks "Start Exchange". The listing transitions to **"Exchange Confirmed"** state with direct contact coordinates displayed.

---

## 15. Key Assumptions

* **[ASSUMP-01] Single Campus Context:** The MVP operates in a shared college community context with physical proximity, without implementing student identity or trust verification systems.
* **[ASSUMP-02] Non-Monetary Value Primacy:** While "Sell" is supported as an exchange type, the primary differentiator and platform value resides in swaps, skill trades, and opportunity exchanges. Real payment gateway integrations are unnecessary for the MVP.
* **[ASSUMP-03] Reciprocal Matching Scope:** Reciprocal matching identifies complementary pairings between what students have and what they need (including across categories) without requiring heavyweight vector database clusters for the MVP. (Exact algorithmic mechanics are defined in technical architecture documents).
* **[ASSUMP-04] Direct Contact Handoff:** For the MVP, once an exchange is initiated and confirmed, student contact coordinates (e.g., campus email/handle) are presented to facilitate peer-to-peer fulfillment.
* **[ASSUMP-05] Curated Seed Dataset:** A high-quality realistic seed dataset representing all 7 categories and 5 exchange types will be bundled to guarantee immediate live demonstrations without cold-start friction.

---

## 16. Out-of-Scope Specification (Strict Anti-Scope Creep)

The following features are strictly prohibited from the 5-hour hackathon MVP:
1. **Real Payment Processing:** No Stripe, PayPal, Razorpay, or fiat escrow contracts.
2. **Identity & Trust Verification Systems:** No student ID card scanning, .edu email verification, OAuth SSO, or university LDAP integrations (use simple profile selector / mock session).
3. **Dedicated Vector Database Infrastructure:** No external Pinecone, Milvus, or Qdrant cluster setup.
4. **Live WebSockets Real-Time Chat System:** No complex live socket rooms; use direct exchange confirmed handoff state.
5. **Geolocation & Map Interfaces:** No Google Maps / Mapbox coordinate tracking; campus proximity is assumed.
6. **Dispute Resolution & Escrow Mediation:** No administrative dispute arbitration dashboards.

---

## 17. Product Principles

1. **Solve the Assigned Problem Before Adding Features:** Prioritize the exchange of resources, skills, and opportunities above speculative functionality.
2. **Categories Organize Discovery; They Do Not Limit Matching:** Allow cross-category matches across any domain (e.g., Study ↔ Tech, Skills ↔ Opportunities).
3. **Strictly Separate Offer, Need, Category, and Exchange Type:** Never collapse these independent dimensions into a single unstructured field.
4. **Unified Creation Flow:** Categories and exchange types are classification metadata handled through one consistent exchange creation journey.
5. **AI Interprets and Ranks; Application Logic Controls State:** AI performs parsing, scoring, and rationale generation; the application handles validation, lifecycle, and storage.
6. **Cross-Category Reciprocal Matching is the Core Differentiator:** Focus on bilateral value trades where both students solve each other's problems.
7. **Optimize for a Complete Working Journey Within Five Hours:** Build one flawless, airtight end-to-end loop rather than ten half-finished screens.
8. **Prefer Simple, Reliable Implementation Over Heavy Infrastructure:** Eliminate fragile external dependencies that could break during live demonstration.
9. **Never Sacrifice the Core Exchange Journey for Secondary Features:** Every line of design and code must directly support the 60-second Have ↔ Need proof of concept.
