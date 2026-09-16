# 04: Design a Movie Ticket Booking System

## Core Idea
Model cinemas, rooms, seat layouts, screenings, tickets, and orders around a `ScreeningManager` coordinator and a `MovieBookingSystem` facade, with seat pricing driven by the Strategy Pattern.

## Design Framework / Approach
Separate fixed data (`Movie`) from dynamic scheduling (`Screening`), and `Room` from its `Layout` so rooms can share seating arrangements. Centralize screening/ticket lookups in `ScreeningManager` with map-based O(1) indexing, and expose a `MovieBookingSystem` facade.

## Key Concepts & Components
- **Movie**: immutable static data (title, genre, duration), reused across cinemas.
- **Cinema / Room**: composition — a Cinema has Rooms; each Room has a Layout.
- **Layout**: nested `Map<Integer, Map<Integer, Seat>>` for row/column access plus `Map<String, Seat>` by number; supports irregular layouts and `computeIfAbsent`.
- **Seat**: holds `seatNumber` + `PricingStrategy`; pricing delegated, not embedded.
- **PricingStrategy** (interface): `NormalRate`, `PremiumRate`, `VIPRate` — add rates without modifying code (OCP).
- **Screening**: binds Movie + Room + time slot.
- **Ticket / Order**: Ticket links Screening + Seat + price (snapshot at purchase); Order groups tickets and sums totals.
- **ScreeningManager**: `Map<Movie, List<Screening>>` and `Map<Screening, List<Ticket>>`; computes available seats by removing booked seats.

## Trade-offs & Anti-patterns
- **Merging Room and Layout**: limits flexibility for varied seating arrangements — keep separate.
- **2D array for Layout**: fails on irregular/dynamic layouts — prefer nested maps.
- **Embedding price in Seat**: couples pricing to the seat — use the Strategy Pattern.
- **List-based lookups**: O(n) searches vs map-based O(1) — use maps for screenings/tickets.

## Key Takeaways
1. Keep a ticket's price fixed at purchase so later pricing changes don't retroactively alter sales.
2. Snapshot price in `Ticket` rather than re-reading the seat's live strategy.
3. Choose **pessimistic locking** (SeatLockManager, timeouts) for high-contention screens and **optimistic locking** (atomic check-then-book) for low-contention — ask the interviewer which they expect.

## Connects To
- **01 A Framework for the OOD Interview**: concurrency handling in the deep-dive step.
- **03 Design a Parking Lot**: Strategy pattern source for pricing.
- **02 OOP Fundamentals**: separation of fixed vs dynamic data (SRP).
