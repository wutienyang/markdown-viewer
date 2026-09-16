# 05: Design a Unix File Search System

## Core Idea
Separate filesystem traversal (`FileSearch`) from condition evaluation (`Predicate`), using the Composite Pattern to combine simple comparisons into arbitrarily nested AND/OR/NOT search trees.

## Design Framework / Approach
Treat files and directories uniformly (Unix "everything is a file"). Decouple three concerns: `FileSearch` traverses, `FileSearchCriteria` wraps a `Predicate`, and `Predicate`/`ComparisonOperator` evaluate. Compose predicates recursively with the **Composite Pattern**; use a stack (not recursion) for traversal.

## Key Concepts & Components
- **File**: immutable model with `isDirectory`, `size`, `owner`, `filename`, and an `entries` set; `extract(FileAttribute)` maps enum to value.
- **FileAttribute** (enum): `IS_DIRECTORY`, `SIZE`, `OWNER`, `FILENAME` — type-safe, extensible.
- **FileSearch**: stack-based (ArrayDeque) depth-first traversal avoiding stack overflow on deep trees.
- **FileSearchCriteria**: lightweight wrapper delegating to a Predicate.
- **Predicate** (interface): `isMatch(File)`; `SimplePredicate<T>` compares one attribute; `CompositePredicate` (marker) → `AndPredicate`, `OrPredicate`, `NotPredicate`.
- **ComparisonOperator<T>** (interface, generic): `EqualsOperator`, `GreaterThanOperator`, `LessThanOperator`, `RegexMatchOperator`.

## Trade-offs & Anti-patterns
- **Merging FileSearchCriteria with Predicate / FileSearch**: couples traversal to filtering — keep separate for swappable criteria.
- **String-based operators** ("equals", ">"): runtime parsing and error risk.
- **Enum-based operators**: type-safe but require modifying the enum for each new operator — prefer the interface approach.
- **Recursive traversal**: stack overflow on deep trees — use an explicit stack.

## Key Takeaways
1. Use the Composite Pattern so simple and nested conditions are evaluated through one uniform `Predicate` interface.
2. Enforce type safety with generics (`ComparisonOperator<T>`) to prevent mismatched attribute comparisons.
3. Prefer an interface over an enum for operators so new comparisons (e.g., case-insensitive) are added without touching existing code.

## Connects To
- **02 OOP Fundamentals**: abstraction + polymorphism applied to operators.
- **08 Design a Grocery Store System**: reuses Composite Pattern for discount criteria.
- **03 Design a Parking Lot**: facade/strategy patterns shared across designs.
