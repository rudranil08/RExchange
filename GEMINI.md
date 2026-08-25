# GEMINI.md — Engineering & Agent Protocol for RExchange

**Project:** RExchange — AI-Powered Campus Exchange Platform  
**Target Timeline:** 5-Hour AI Vibe-Coding Hackathon MVP  
**Status:** Active Persistent Engineering Rules  
**Scope:** Behavioral, architectural, and operational rules for AI coding agents.

---

## 1. Source of Truth

* **`PROBLEM_SPEC.md`** is the authoritative specification for product vision, problem definition, core user journey, and MVP scope.
* As implementation progresses, subsequent artifacts become authoritative for their specific domains:
  - `ARCHITECTURE.md` → System architecture, component structure, state management, and deployment.
  - `DATAMODEL.md` → Schemas, entities, relationships, data types, and seed data definitions.
  - `AICONTRACT.md` → AI prompt contracts, response schemas, validation rules, and parser boundaries.
* **Pre-Execution Reading:** Always read the authoritative artifact before making decisions in its domain.
* **No Silent Contradictions:** Never introduce changes that contradict existing artifacts. If a requirement or user prompt appears to conflict with an artifact:
  1. Identify the conflict explicitly.
  2. Explain the discrepancy.
  3. Do not silently modify the artifact.
  4. Wait for explicit user confirmation or an official specification update.

---

## 2. MVP Priority

RExchange is built under a strict ~5-hour hackathon timeline. Prioritize in this exact order:

1. **Correctness:** Accurately solving the core problem defined in `PROBLEM_SPEC.md`.
2. **Complete Core Loop:** Delivering the complete, unbroken end-to-end user journey:  
   `Student Input → AI Interpretation → Reciprocal Match → Match Explanation → Exchange Confirmed`
3. **Reliability:** Deterministic, crash-free execution during live demonstrations.
4. **UX & Visual Polish:** Clean typography, clear hierarchy, distinct Have/Need states, responsive layout.
5. **Demo Readiness:** Instant seed data availability, sub-60-second walkthrough capability.
6. **Secondary Features:** Enhancements added only after the primary loop is rock-solid.

*Rule: Never sacrifice or delay the core exchange journey for non-essential functionality.*

---

## 3. Scope Control

Do not build features simply because they are common in general marketplaces. Only implement functionality that directly serves the approved MVP journey.

**Strictly Prohibited for MVP:**
* Real payment gateways (Stripe, Razorpay, escrow systems).
* Complex authentication / identity verification (SMS OTP, LDAP, .edu email scanning, OAuth SSO).
* Live WebSockets real-time chat infrastructure.
* Dedicated external vector database clusters (Pinecone, Milvus, Qdrant).
* Push notifications, background workers, or microservice architectures.
* Geolocation / GPS map coordinate tracking.
* Administrative moderation or dispute arbitration dashboards.

*Rule: Prefer the simplest, most resilient implementation that satisfies the functional requirement.*

---

## 4. Architectural Discipline

* Inspect existing code and understand system patterns before making modifications.
* Identify and reuse existing components, utilities, and types.
* Make the smallest appropriate change to satisfy the task; avoid unrelated refactoring.
* Do not rewrite working subsystems merely for stylistic preference.
* Avoid speculative abstractions, unnecessary design patterns, or premature optimization.

---

## 5. Dependency Discipline

* Maximize the utility of the existing project stack before introducing new packages.
* Verify whether an already-installed library can fulfill the requirement.
* Introduce a new dependency only when it delivers substantial, irreplaceable value and carries zero runtime risk.
* Never install packages simply because they are popular or convenient.

---

## 6. AI Boundary

AI functions strictly as an **interpretation and reasoning layer**, not an autonomous state manager.

* **Permitted AI Tasks:**
  - Parsing natural-language prompts into structured listing fields (`Offer`, `Need`, `Category`, `Exchange Type`, `Tags`).
  - Evaluating and ranking reciprocal matches across listings (including cross-category pairings).
  - Generating clear, human-readable match explanations.
* **Deterministic Application Ownership:**
  - Application logic strictly controls validation, persistence, state transitions (`active` → `pending` → `confirmed`), and contact coordinate disclosure.
* **Safety & Anti-Hallucination:**
  - AI outputs must be validated before being ingested by application state.
  - AI must **never** fabricate users, listings, prices, availability, or transaction histories.
  - Adhere strictly to `AICONTRACT.md` once defined.

---

## 7. Category and Exchange-Type Rule

* The 7 Categories (*Study, Tech & Electronics, Tickets & Events, Skills & Services, Opportunities, Free / Give Away, Other*) and 5 Exchange Types (*Swap, Skill Exchange, Sell, Give Away, Offer*) are **metadata and discovery attributes**.
* They are **NOT** separate application workflows or divergent forms.
* The application must use **one single, unified exchange creation flow** across all categories and exchange types.
* Categories must never restrict reciprocal matching (cross-category trades like *Coding Tutoring ↔ Pitch Deck Design* are primary differentiators).

---

## 8. Code Quality

* **TypeScript First:** Strict typing, clean interfaces, and predictable data flow.
* **Focused Components:** Small, single-responsibility components with clear prop interfaces.
* **Clarity over Cleverness:** Simple functions, descriptive naming, predictable state.
* **Clean Codebase:** No dead code, no unused imports, no duplicated logic, no deeply nested conditionals.
* **Meaningful Comments:** Document non-obvious business logic or constraints; do not restate what readable code already expresses.

---

## 9. UI / UX Standards

* Design a polished, modern, campus-focused platform rather than a generic utility dashboard.
* **Core Principles:**
  - Distinct visual badges for **"OFFERING" (Have)** and **"SEEKING" (Need)**.
  - Clear visual hierarchy and strong typography.
  - Obvious primary action buttons (e.g., "AI Smart Post", "Find Matches", "Start Exchange").
  - Meaningful loading, empty, and fallback states.
  - Restrained animations that aid comprehension rather than distract.

---

## 10. Testing & Verification

* Always verify code changes before claiming task completion:
  - Run type checks, lint checks, and builds where applicable.
  - Validate the affected user flow manually or programmatically.
  - Check for regressions in adjacent functionality.
* For UI changes: Verify rendered layout, responsive behavior, and state transitions.
* For AI features: Verify behavior with valid inputs, edge cases, and graceful fallback on malformed or failed responses.
* *Rule: Never declare a task complete without empirical verification.*

---

## 11. Strict Debugging Protocol

When encountering any defect, follow this 7-step protocol strictly:

1. **Reproduce:** Establish exact steps and input conditions triggering the failure.
2. **Observe:** Gather error messages, stack traces, browser console logs, network responses, and build output.
3. **Inspect:** Trace data flow and inspect relevant source files before editing code.
4. **Identify Root Cause:** Pinpoint the underlying defect with evidence. **Do not guess or apply random trial-and-error edits.**
5. **Make Minimal Fix:** Apply the smallest targeted code change that eliminates the root cause without collateral refactoring.
6. **Verify:** Test the original failure scenario to prove resolution, run build checks, and confirm no regressions.
7. **Report:** Document root cause, files changed, fix description, verification performed, and any remaining items.

*Critical Rule: Never claim a bug is fixed without verifying against the original failure condition.*

---

## 12. Change Control

Before modifying code, confirm:
1. What specific requirement from `PROBLEM_SPEC.md` / `ARCHITECTURE.md` does this change satisfy?
2. Which specific files are affected?
3. What existing behavior or data structures could be impacted?

*Never modify unrelated files or silently alter data schemas, AI contracts, or product requirements.*

---

## 13. Token and Context Efficiency

* Use project artifacts (`PROBLEM_SPEC.md`, `GEMINI.md`, etc.) as persistent reference points.
* Do not restate entire specifications or reproduce large blocks of unchanged documentation.
* Read only the files necessary for the current task.
* Keep implementation plans concise, actionable, and structured.
* Keep progress reports brief, factual, and focused on completed deliverables.

---

## 14. Implementation Style

* Work incrementally: **Inspect → Plan → Implement → Verify → Proceed**.
* Maintain a working, buildable application state across each milestone.
* Do not attempt monolithic, multi-feature refactors in a single pass.
* Keep feature branches / working trees clean and logically structured.

---

## 15. Git Safety & Milestones

* Use version control as a safety net before applying major changes.
* Structure commits around logical milestones:
  - `foundation`: Scaffolding, configuration, base layouts
  - `listing-engine`: Unified listing creation and browsing
  - `ai-parser`: Natural language extraction engine
  - `matching-engine`: Reciprocal matching & explanation UI
  - `exchange-flow`: Confirmation state & contact handoff
  - `polish`: Seed data, demo optimizations, visual refinements
* Never execute destructive Git commands (`reset --hard`, force push) without explicit approval.

---

## 16. Security & Secrets Management

* Never hardcode API keys, tokens, database credentials, or secret keys in source files.
* Use environment variables (`.env.local` / `.env.example`) for all secrets.
* Never expose secret keys to client-side bundles.
* If required environment variables are absent, flag them immediately with clear setup instructions.

---

## 17. Error Handling & Graceful Degradation

* Never silently swallow exceptions.
* **AI Service Failures:** If external AI calls timeout or fail, preserve user inputs, provide a friendly status indicator, and fall back gracefully to deterministic keyword/category matching.
* **Data / Network Failures:** Present clean error UI states without corrupting in-memory or persisted store states.

---

## 18. Demo-First Reliability

The platform must reliably deliver the sub-60-second demonstration:
1. Student inputs natural-language exchange prompt.
2. AI extracts structured Offer / Need / Category / Type.
3. System matches with complementary cross-category peer listing.
4. AI renders clear, human-readable match rationale.
5. Student triggers exchange and transitions to **Exchange Confirmed**.

*Bundled seed data must guarantee instant, realistic results during live evaluation.*

---

## 19. Decision Priority Matrix

When selecting between multiple valid approaches, choose the solution that is:
1. **Most compliant** with `PROBLEM_SPEC.md`.
2. **Simplest** in architecture and implementation.
3. **Most reliable** during live demonstration.
4. **Fastest** to build and verify within the 5-hour window.
5. **Easiest** to debug if an unexpected edge case occurs.

*Rule: Never choose complexity for the sake of sophistication.*

---

## 20. Standard Agent Response Format

When completing any implementation or debugging step, report using this concise structure:

```markdown
### Completed
[Specific functionality or task implemented]

### Files Changed
[List of modified or created file paths]

### Verification
[Commands run, test steps performed, and observed outcomes]

### Remaining Issues / Next Step
[Any unresolved items, or the immediate next milestone]
```

---

## Core Guiding Tenet

> **Correct → Simple → Reliable → Polished**  
> *always beats*  
> **Complex → Feature-heavy → Fragile**
