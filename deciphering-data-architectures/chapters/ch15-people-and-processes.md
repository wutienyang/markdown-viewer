# Chapter 15: People and Processes

## Core Idea
People and processes — not technology — determine whether a data project succeeds. Most failures trace to missed roles, poor communication, and specific avoidable pitfalls. This chapter catalogs the roles, the 15 classic pitfalls, and the tips that separate winning projects from the ~87% of data science projects that never reach production.

## Frameworks Introduced
- **Team roles (MDW/fabric/lakehouse)**: data architect, data engineer, data steward, DBA, data analyst, data scientist, business analyst, project manager/scrum master, data privacy officer, data governance manager, data quality manager.
  - When to use: staffing any centralized-architecture project. One person may hold several roles in small companies.
- **Data-mesh team structure**: domain teams (with a domain data product owner) + a self-service infrastructure platform team + a federated governance platform team.
  - When to use: staffing a data mesh — the mesh adds whole platform teams and per-domain role replication.
- **The 80% efficiency plan**: aim for each member to spend ~80% of hours on the project, reserving 20% for meetings, learning, and leave.
  - When to use: planning a project manager's schedule; below 80% invites missed deadlines.

## Key Concepts
- **The 15 pitfalls** (each with a prevention):
  1. Executives think BI is "easy" → educate them (even a one-day coding session).
  2. Wrong technologies → form product research committees.
  3. Too many requirements → gather a few weeks' worth, then gather in parallel with coding.
  4. Too few requirements → iterate; revisit design in cycles.
  5. Unvalidated reports → rigorous QA against a known-good report.
  6. Inexperienced consultants → ask who will actually work on the project.
  7. Offshore-outsourced consultants → verify no silent offshoring.
  8. Handing ownership to consultants → put your own PMs in place (status reports aren't enough).
  9. No knowledge transfer → embed your people and demand training/review.
  10. Mid-project budget cuts → cut scope (data sources), not people/quality.
  11. Fixed end date → keep schedules flexible.
  12. Mirroring source data structure → model for the business, not the source.
  13. Slow response times → measure and match the old system's baseline.
  14. Over/under-designing → balance robustness with simplicity.
  15. IT/business communication gap → use business analysts, regular dialogue, documented requirements.

## Mental Models
- Think of a project champion vs. a project manager: the champion provides strategic advocacy and resources from above; the PM is "in the trenches."
- "A Lamborghini in first gear" — untrained users underuse powerful tools; train them and let them build a prototype.
- Trust is the currency: an incorrect report or a slow dashboard destroys it, and it's very hard to win back.

## Anti-patterns
- **Spending a year on requirements**: hundreds of pages nobody reads; requirements should be gathered iteratively.
- **"When you have a hammer, everything is a nail"**: teams pick products they've heard of (SQL Server as a data lake).
- **Re-creating existing reports 1:1 in a migration**: if the new solution isn't better, users ask "why did we spend all this money?"
- **Making consultants a black box**: no transparency, no knowledge transfer, no ownership.

## Worked Example
**The $100M caution (Ch 1) meets the 15 pitfalls**: a company spent two years and $100M building the wrong architecture, then scrapped it — a compound failure of pitfall #2 (wrong technology), #12 (mirroring source data), and #14 (under-design). The prevention is the whole chapter: educate executives, research products, model for the business, and involve end users early so they champion rather than resist the change.

## Key Takeaways
1. Assign clear roles; the business analyst is the critical bridge between IT and the business domains.
2. Avoid the 15 pitfalls — the top killers are wrong technology, unrealistic timelines, and unvalidated reports.
3. Involve end users early, show results often, and let them build a prototype — ownership converts them into allies.
4. Never skimp: spend more up front for a solution that returns far more value long-term.
5. Have at least one person who deeply understands data architectures lead the architecture decision.

## Connects To
- **Ch 3**: the ADS is the up-front practice that prevents the requirements/communication pitfalls.
- **Ch 13–14**: the mesh demands a fundamentally different team organization (domain teams + platform teams).
- **Ch 16**: the technologies that these people will build with.
