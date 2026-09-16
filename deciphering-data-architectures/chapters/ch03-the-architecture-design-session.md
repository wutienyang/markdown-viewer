# Chapter 3: The Architecture Design Session

## Core Idea
An Architecture Design Session (ADS) is a structured, vendor-neutral discovery workshop that produces an architecture blueprint and an action plan. Done well, it is the single highest-leverage practice for picking the right architecture and avoiding a costly rebuild.

## Frameworks Introduced
- **Architecture Design Session (ADS)**: a structured discussion with business and technical stakeholders, driven by technical experts, focused on defining the high-level design of a data solution.
  - When to use: at the very start of any data architecture project.
  - How: run discovery → whiteboard the architecture → capture goals/pain points/parking lot → produce two deliverables (blueprint + plan of action).
- **"Think big, start small"**: design the end-state architecture but plan to start with two or three low-risk, high-reward data sources for quick wins.
  - When to use: whenever a project risks being too ambitious to show early value.
- **Vendor-neutral discovery**: ask *no* product questions during discovery; only apply products after the architecture is understood.
  - When to use: the discovery phase of every ADS.
  - How: run through the ADS questionnaire first, then map products to the neutral architecture.

## Key Concepts
- **Deliverables of an ADS**: an architecture "blueprint" and a high-level plan of action (demos, proofs of concept, product discussions).
- **"Business therapy"**: a side effect of the ADS — stakeholders in the same room often solve each other's blockers while the architect listens.
- **Discovery phase**: the opening 1–2 hours of questions about pain points, current/future architecture, use cases, and the business.
- **Parking lot**: a whiteboard list of off-topic and follow-up items, tracked and assigned after the session.
- **GA / public preview / private preview**: product release stages; affects what you may recommend and when.
- **Science project**: a technology test with no solid business case — the ADS flushes these out and limits resources to them.

## ADS Questionnaire (the core checklist)
The questions to ask during discovery — all product-neutral:
1. Is the business using the cloud?
2. New solution or migration?
3. Skill sets of the engineers?
4. Will you use nonrelational data (variety)?
5. How much data to store (volume)?
6. Will you have streaming data (velocity)?
7. Dashboards and/or ad hoc queries?
8. Batch and/or interactive queries?
9. How fast do reports need to run (SLAs)?
10. Predictive analytics / machine learning?
11. High-availability and disaster-recovery (RTO/RPO) requirements?
12. Do you need to master the data (MDM)?
13. Security limitations storing data in the cloud (data sovereignty, PII)?
14. 24/7 client access required?
15. Concurrent users at peak / average?
16. Skill level of end users (no-code vs. high-code)?
17. Budget?
18. Planned timeline?
19. Source data in cloud and/or on-prem?
20. Daily import volume?
21. Current pain points (performance, scale, storage, concurrency, query times)?
22. Third-party / open source tools?
23. OK with preview products?
24. Security requirements / data sovereignty?
25. Is data movement a challenge?
26. How much self-service BI is desired?

## Anti-patterns
- **Jumping to the solution too early**: the author's own mistake — demonstrating a product as soon as "data warehouse" is mentioned, before discovering the customer didn't actually need one.
- **Letting slides replace the whiteboard**: too many slides turns the ADS into a presentation instead of discovery.
- **Skipping scheduled breaks**: tempting but a mistake; you'll lose the room.
- **Arguing with a difficult participant**: don't argue even if right — defuse and park the topic offline.
- **Faking an answer**: never make up an answer to a question you can't answer; say you'll find out and follow up.
- **Neglecting the pain-point checklist**: every pain point should be addressed by the end of the architecture; otherwise schedule a follow-up.

## Worked Example
The author's first ADS as a cautionary tale: a dozen customer attendees who had never met were discussing their environment. A few raised pain points blocking progress, and another attendee spontaneously advised on the blocker — then two more blockers got solved while the architect sat back and listened. Lesson: discovery works because it puts the right people in the room; the architect's job is to ask questions and get out of the way, not to perform.

## Key Takeaways
1. Prepare a full day; schedule breaks; identify budget, timeline, and the decision maker up front.
2. Run a pre-call with the account team *and* the customer to align the agenda and surface materials.
3. Keep discovery product-neutral: ask every question before mentioning any vendor or product.
4. Whiteboard goals, pain points, and a parking lot — and verify all pain points are addressed by the end.
5. Reserve the last 30 minutes for follow-ups; then email a summary, architecture, action items, parking lot, and survey.
6. Facilitation is a skill: read the room, use humor, stay humble, and build stamina over time.

## Connects To
- **Ch 1**: the six Vs become the discovery questions (volume/velocity/variety/etc.).
- **Ch 2**: the questionnaire determines which of the six architecture types fits.
- **Ch 4–14**: the ADS output feeds directly into the choice among RDW, MDW, fabric, lakehouse, and mesh.
- **Ch 15**: the "why projects fail" pitfalls are the pain points an ADS is designed to catch early.
