# 02: OOP Fundamentals

## Core Idea
Master the four OOP pillars — encapsulation, abstraction, inheritance, polymorphism — and the S.O.L.I.D. principles as the shared vocabulary for justifying every design decision in an OOD interview.

## Design Framework / Approach
Build designs on four cornerstones, then layer S.O.L.I.D. on top. Prefer composition over inheritance when flexibility or loose coupling matters; use inheritance only for stable "is-a" hierarchies.

## Key Concepts & Components
- **Encapsulation**: bundle data (private attributes) with methods (public getters/setters) to hide internal state and control access.
- **Abstraction**: expose *what* an object does while hiding *how*, via abstract classes and interfaces.
- **Inheritance**: subclass inherits from a superclass ("is-a"); supports single, multilevel, and hierarchical forms.
- **Polymorphism**: objects respond differently through a common interface — compile-time (method overloading) vs runtime (method overriding / dynamic dispatch).
- **Composition**: "has-a" relationship via contained objects/interfaces (e.g., `BarkBehavior`) — preferred alternative to deep inheritance.
- **Single Responsibility Principle (SRP)**: a class has one reason to change.
- **Open/Closed Principle (OCP)**: open for extension, closed for modification (via abstract classes/interfaces).
- **Liskov Substitution Principle (LSP)**: subclasses replace base classes without breaking contracts (weaker preconditions, stronger postconditions, preserved invariants).
- **Interface Segregation Principle (ISP)**: split fat interfaces so clients don't depend on methods they don't use.
- **Dependency Inversion Principle (DIP)**: depend on abstractions, not concrete low-level modules; inject dependencies.

## Trade-offs & Anti-patterns
- **Over-encapsulation**: getter/setter for every attribute makes code verbose.
- **Inheritance tight coupling**: superclass changes break subclasses; avoid forcing irrelevant behavior (e.g., `fly()` on Penguin).
- **Inheritance locks relationships at design time**: a RobotDog that barks but doesn't eat can't cleanly extend Animal — use composition.
- **Fat interfaces** (ISP violation): force empty or throwing implementations (e.g., Robot's `eat()`).

## Key Takeaways
1. Prefer composition over inheritance for swappable, loosely coupled behavior; reserve inheritance for stable "is-a" hierarchies.
2. Articulate each S.O.L.I.D. principle with a concrete before/after refactor to show reasoning.
3. Use polymorphism + interfaces to add new types (shapes, media) without modifying existing code.

## Connects To
- **03 Design a Parking Lot**: `FareStrategy` (Strategy pattern) and `getSize()` abstraction demonstrate OCP/DIP.
- **05 Design a Unix File Search System**: generics + interface-based `ComparisonOperator` for type-safe extension.
- **08 Design a Grocery Store System**: criteria/strategy separation for extensible discounts.
