# 04: A Framework For System Design Interviews

## Core Idea
A system design interview is a collaborative problem-solving exercise judged on process, not a "correct" answer — follow a 4-step framework and treat the interviewer as a teammate.

## Design Framework / Approach
Use the **4-step process**:

1. **Understand the problem and establish design scope** (3–10 min) — ask clarifying questions (features, users, scale, stack); write down assumptions. Don't jump to a solution.
2. **Propose high-level design and get buy-in** (10–15 min) — draw box diagrams (clients, APIs, servers, data stores, cache, CDN, queue); run back-of-the-envelope calculations; walk through concrete use cases.
3. **Design deep dive** (10–25 min) — with the interviewer, identify and prioritize the most important components; drill into those, not trivia (avoid e.g. EdgeRank details).
4. **Wrap up** (3–5 min) — identify bottlenecks and improvements, recap the design, discuss error cases, ops/monitoring, and how to scale the next 10×.

## Key Concepts & Components
- **Clarifying questions**: features, user count, growth rate, tech stack, existing services.
- **Box diagram / blueprint**: a coarse component map agreed on before details.
- **Back-of-the-envelope estimation**: validate the blueprint against scale constraints, out loud.
- **Signals the interviewer reads**: collaboration, handling pressure, resolving ambiguity, asking good questions — not just technical skill.
- **Red flags**: over-engineering, narrow-mindedness, stubbornness, silent thinking.

## Trade-offs & Anti-patterns
- **Jumping to a solution without clarifying**: answers the wrong problem — a huge red flag.
- **Over-engineering**: design purity with no regard for compounding cost.
- **Premature deep dive**: going deep on one component before a high-level design is agreed.
- **Wrong granularity**: API endpoints/DB schema are too low-level for huge problems, fair for small ones.

## Key Takeaways
1. Always clarify requirements and state assumptions before designing; communicate continuously.
2. Agree on the blueprint first, then deep-dive the critical components — not the reverse.
3. Budget time explicitly (≈3–10 / 10–15 / 10–25 / 3–5 minutes) and never declare the design "done."

## Connects To
- **03-back-of-the-envelope-estimation**: supplies the numbers used in Step 2.
- **05-design-a-rate-limiter** through **15-design-youtube**: each is a concrete application of this framework.
- **12-design-a-news-feed-system**: the running example used throughout this chapter.
