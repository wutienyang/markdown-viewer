# 23: Hotel Reservation System

## Core Idea
A microservice-based booking system where the core difficulty is concurrency — preventing double-booking and race conditions — solved with idempotent APIs, optimistic locking / DB constraints, and an inventory table keyed by room *type* and *date*.

## Design Framework / Approach
Choose a relational DB (ACID + read-heavy). Model inventory as `room_type_inventory(hotel_id, room_type_id, date)` with `total_inventory` and `total_reserved`. Reserve by checking `total_reserved + N <= 110% * total_inventory` over the date range. Use idempotency keys (`reservation_id`) for double-submit, and optimistic locking or DB constraints for concurrent bookings.

## Key Concepts & Components
- **Reserve room type, not room**: room numbers are assigned at check-in — API uses `roomTypeID`, not `roomID`.
- **Overbooking (10%)**: sell more than inventory anticipating cancellations; encoded as `<= 110% * total_inventory`.
- **Idempotency key**: `reservation_id` as PK — unique constraint blocks double-book from double-click.
- **Pessimistic locking (`SELECT ... FOR UPDATE`)**: serializes but deadlocks and doesn't scale; avoid.
- **Optimistic locking (version column)**: no locks; retry on version mismatch; degrades under high contention (fine at low QPS).
- **Database constraint (`CHECK total_inventory - total_reserved >= 0`)**: simple, rolls back oversells; not version-controllable.
- **Inventory cache (Redis)**: TTL + LRU; serves reads; DB stays source of truth and re-validates.
- **Microservice consistency**: prefer keeping reservation+inventory in one DB (ACID); else 2PC or **Saga** (compensating transactions).

## Trade-offs & Anti-patterns
- **Reserving a specific room**: wrong for hotels (unlike Airbnb); reserve room *type*.
- **Pessimistic locking**: heavy contention/deadlocks; only when conflicts are dense.
- **Optimistic locking under high concurrency**: many retries → bad UX; pick DB constraints for simplicity.
- **Pure microservice (separate DBs)**: forces 2PC/Saga complexity; a pragmatic shared DB within one service is often better.

## Key Takeaways
1. Room-type + per-date inventory rows make availability and overbooking a simple range check.
2. Use idempotency keys + a DB-level guard (unique constraint or CHECK) as the final defense against double-booking.
3. Cache inventory in Redis for reads, but always re-validate against the DB (source of truth).

## Connects To
- **Payment System**: reservation→payment flow, idempotency keys, and reconciliation.
- **Design a Key-value Store**: Redis TTL/LRU for the inventory cache.
- **Digital Wallet**: distributed transaction (Saga/TC/C) patterns shared across both.
