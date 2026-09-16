# 01: A framework for Mobile SD interviews

## Core Idea
Use a fixed 5-step framework to stay organized under a 45-60 minute clock. Without structure, open-ended design problems drift; a methodical sequence keeps you and the interviewer aligned.

## Design Framework / Approach
The five steps, with a suggested time split for a 45-minute interview:

1. **Understand the problem and establish scope (5-10 min)** — ask what we're building (features, critical user journeys), for whom (DAU, growth, MVP vs final, region/usage), and system constraints (platforms, existing APIs). State assumptions explicitly.
2. **API design (5-10 min)** — for apps, define communication protocol and endpoints; for libraries, define the public API. Outline data models (JSON payloads, Swift structs, Kotlin data classes, protocol buffers).
3. **High-level client architecture (10-15 min)** — draw the component diagram (UI layer + data layer) and validate an end-to-end flow, flagging deep-dive points.
4. **Design deep dive (15-20 min)** — target two to three strong discussions of bottlenecks; update diagrams as decisions change.
5. **Wrap-up (0-5 min, optional)** — summarize key decisions, discuss improvements without defending as perfect, cover edge cases and future scale.

## Key Concepts & Components
- **Scope questions**: three families — what we're building, for whom, and what constraints exist.
- **API contract**: establishes the client-backend agreement and aligns understanding early.
- **State holder / ViewModel**: manages UI state and screen logic in the high-level diagram.
- **Deep dive**: the core differentiator — pick bottlenecks the interviewer cares about.
- **Reference back to requirements**: justify later choices using answers gathered in step 1.

## Trade-offs & Anti-patterns
- **Asking every possible question**: use judgment, not a checklist; focus on what shapes this design.
- **Over-polishing step 3**: build a skeleton, not a blueprint; refine later.
- **Defending your design as perfect**: instead discuss where it could evolve.
- **Rigid time budgets**: treat the split as guidance and adapt to the interviewer's interest.

## Key Takeaways
1. Lock scope first — every later technical choice traces back to those answers.
2. Spend the most time on the data layer and deep dives; that's where senior signals live.
3. Keep diagrams current as you refine, and close by signaling self-awareness on trade-offs.

## Connects To
- **00-introduction**: seniority rubrics the framework must satisfy.
- **02-news-feed-app** through **08-youtube-app**: case studies applying each step end to end.
- **10-quick-reference-cheat-sheet-for-msd-interview**: the domain checklist to consult during step 1 and the deep dive.
