# 01: A Framework for the OOD Interview

## Core Idea
Use a structured four-step framework to convert vague requirements into a concrete class design or code, while staying adaptable to shifting scope, early deep-dives, and curveball questions.

## Design Framework / Approach
Three deliverable formats, each with a preferred output — ask early "Are we focusing on a high-level class diagram, code structure, or full implementation?" (45–60 min typical). Then follow the four steps:

1. **Requirements Gathering** (5–10 min): clarify functional/non-functional requirements, ask targeted questions, confirm assumptions. Map **nouns to objects** and **verbs to methods**.
2. **Identify Core Objects** (3–7 min): walk a primary use case step-by-step to surface classes and interactions.
3. **Design Class Diagram and Code** (20–25 min): choose **top-down** (parent classes first) or **bottom-up** (concrete classes first); enforce **low coupling and high cohesion**; select data structures deliberately (e.g., List vs Set, HashSet vs TreeSet).
4. **Deep Dive Topics** (10–15 min, optional): validate against edge cases and address follow-ups.

## Key Concepts & Components
- **UML Diagrams**: visual class relationships (attributes, methods, interactions).
- **Code Skeleton**: class/method declarations with bodies left unimplemented.
- **Working Code**: fully functional, possibly with test cases.
- **Top-down / Bottom-up**: two directions for building the class model.
- **Low coupling / high cohesion**: assign responsibilities so classes depend minimally and stay focused.

## Trade-offs & Anti-patterns
- **Overly obvious or repeated questions**: signal inattentiveness — ask only essential, unanswered questions.
- **Diving too deep too early**: lose the big picture and run out of time — set expectations and circle back.
- **Premature optimization**: derails momentum; say "this is good enough" and move on.
- **Inheritance vs. composition**: explain *why* you chose; don't just assert the answer.
- **Concurrency**: use locking/optimistic locking at a high level; don't reinvent low-level primitives.

## Key Takeaways
1. Gauge the deliverable format up front and tailor depth to the interviewer's cues.
2. Use concrete examples (one simple, one complex) to expose edge cases during requirements gathering.
3. When challenged, stay calm and justify decisions with trade-off terms (time complexity, extensibility, maintainability).

## Connects To
- **02 OOP Fundamentals**: SOLID principles that guide the class-design step.
- **03 Design a Parking Lot**: the worked end-to-end example of this framework.
- **04 Design a Movie Ticket Booking System**: concurrency (locking) in the deep-dive step.
