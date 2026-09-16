# 07: Design an Elevator System

## Core Idea
Model elevator *behavior* over *data*: separate the `ElevatorSystem` facade, `ElevatorCar` state, `ElevatorDispatch` assignment logic, and swappable `DispatchingStrategy`, using the Strategy Pattern for dispatch and the Observer Pattern for event-driven hallway requests.

## Design Framework / Approach
Start from use cases (request elevator, select floor, report status) since the data model is unclear. Delegate dispatch to `ElevatorDispatch` and isolate dynamic state in `ElevatorStatus`. Make the dispatching algorithm configurable via `DispatchingStrategy`.

## Key Concepts & Components
- **ElevatorSystem** (facade): `getAllElevatorStatuses`, `requestElevator`, `selectFloor`; accepts a `DispatchingStrategy` in its constructor.
- **ElevatorCar**: holds `targetFloors` queue + `ElevatorStatus`; `addFloorRequest` dedupes and updates direction.
- **ElevatorStatus**: snapshot of `currentFloor` + `Direction` (UP/DOWN/IDLE enum).
- **ElevatorDispatch**: `dispatchElevatorCar` selects a car via strategy and adds the floor request.
- **DispatchingStrategy** (interface): `FirstComeFirstServeStrategy`, `ShortestSeekTimeFirstStrategy`; supports dynamic/configurable strategies.
- **HallwayButtonPanel / ElevatorObserver**: Observer Pattern for decoupled, event-driven call requests.

## Trade-offs & Anti-patterns
- **PriorityQueue for stops**: reorders floors, confusing passengers and complicating direction logic — a plain FIFO `Queue` is simpler and fairer.
- **Tightly coupled button → controller queue**: sequential processing delays assignment under load — decouple with Observer.
- **Priority queue of elevators**: continuous reordering overhead outweighs benefits for small elevator counts — iterate a list.
- **Ignoring direction**: assign only elevators moving toward or idle at the request to avoid reversals.

## Key Takeaways
1. When the data model is unclear, drive class design from use cases and behaviors first.
2. Keep state (`ElevatorStatus`) separate from the car so attributes can grow without touching `ElevatorCar`.
3. Use `accessibleFloors` sets and filter in dispatch strategies when elevators serve different floor sets.

## Connects To
- **02 OOP Fundamentals**: Strategy and Observer patterns for extensible behavior.
- **06 Design a Vending Machine**: state/behavior-focused modeling.
- **04 Design a Movie Ticket Booking System**: concurrency/event considerations in deep dives.
