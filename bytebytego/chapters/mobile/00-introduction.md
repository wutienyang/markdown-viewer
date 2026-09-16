# 00: Introduction

## Core Idea
Mobile System Design (MSD) interviews — typically under an hour and intentionally open-ended ("Design Facebook", "Design YouTube") — assess senior-level architectural thinking that coding interviews can't reach. They reward a structured process, deliberate choices, and articulate trade-offs over any single "correct" answer.

## Design Framework / Approach
MSD interviews almost never require real code; focus stays on architecture, API contracts, and reasoning. Interviewers calibrate expectations by seniority, mostly on Big Tech ladders (Google/Meta/Amazon/Microsoft).

- **Mid-level**: ask requirements questions, produce a coherent high-level design, name common mobile patterns, sketch basic APIs, show basic state-management and trade-off awareness.
- **Senior**: drive requirements gathering, proactively surface non-functional requirements, define clear component APIs, justify trade-offs, handle error/edge cases without prompting.
- **Staff+**: navigate ambiguity, design for scale and extensibility, reason about strategy/business impact, articulate risk and failure recovery, and anticipate future constraints.

## Key Concepts & Components
- **Open-ended scope**: the problem is deliberately underspecified; clarifying questions define the design.
- **Functional vs non-functional requirements**: features vs performance/security/scalability/battery/data concerns.
- **Thought process over solution**: most companies value reasoning; some expect industry-standard patterns.
- **Case-study map**: each chapter assigns one app a unique technical focus (REST+pagination for News Feed, WebSockets for Chat, charts+streaming for Stock Trading, etc.).

## Trade-offs & Anti-patterns
- **Reproducing one "right" answer**: there are multiple valid solutions; defend yours and acknowledge limits.
- **Treating the book as definitive**: use it to learn why decisions make sense under constraints, not as dogma.
- **Covering everything**: chapters contain far more detail than a 1-hour interview can hold; select depth strategically.

## Key Takeaways
1. Lead with clarifying questions to pin down scope, scale (DAU), platforms, and out-of-scope features.
2. Speak to the level: demonstrate independence and non-functional awareness appropriate to your seniority.
3. Use case studies to practice extending and challenging the book's decisions, not memorizing them.

## Connects To
- **01-a-framework-for-mobile-sd-interviews**: the 5-step method operationalizes this intro.
- **09-mobile-system-design-building-blocks**: the reusable vocabulary referenced across every case study.
- **10-quick-reference-cheat-sheet-for-msd-interview**: the condensed recall checklist for interview day.
