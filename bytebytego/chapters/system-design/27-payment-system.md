# 27: Payment System

## Core Idea
A payment backend where correctness, not throughput, is the goal (10 TPS) — built on a double-entry ledger, exactly-once via **retry + idempotency**, and **reconciliation** as the last line of defense against distributed inconsistency.

## Design Framework / Approach
Split into pay-in (PSP pulls from buyer's card into platform account) and pay-out (third-party provider pays sellers). Components: payment service (risk check) → payment executor → PSP/card scheme; wallet and ledger updated after success. Use a hosted PSP payment page so card data never touches your system. Deep-dive: PSP integration, reconciliation, retry/idempotency, and consistency.

## Key Concepts & Components
- **Double-entry ledger**: every transaction debits one account and credits another; sum of entries = 0 for traceability.
- **Payment event vs payment order**: one checkout → one event → several orders; `payment_order_id` doubles as the PSP idempotency key (nonce).
- **Hosted payment page**: PSP collects card data directly; token (registration) + webhook (async status) + redirect URL.
- **Reconciliation**: nightly settlement file from PSP/bank compared to ledger; mismatches → auto-adjust, manual queue, or investigation.
- **Retry strategies**: immediate/fixed/incremental/exponential backoff/cancel; `Retry-After` header.
- **Idempotency**: `Idempotency-Key` header (UUID); DB unique constraint on the key; concurrent duplicates → `429`.
- **Retry queue + dead-letter queue**: transient errors retried; repeated failures isolated for inspection.
- **Amount as string**: avoid double precision rounding (ISO 4217 currency).

## Trade-offs & Anti-patterns
- **Synchronous internal calls**: low performance, poor failure isolation, tight coupling — prefer async queues (Kafka for multi-receiver fan-out).
- **Storing card numbers**: triggers PCI DSS — use PSP-hosted pages and tokenization.
- **Trusting the external PSP**: always reconcile; don't assume idempotency is honored.
- **Replication lag**: read/write from primary only, or use consensus DBs (Paxos/Raft) to keep replicas in sync.

## Key Takeaways
1. Exactly-once = at-least-once (retry) + at-most-once (idempotency key), not a single magic switch.
2. The double-entry ledger and reconciliation are non-negotiable for financial correctness.
3. Keep money amounts as strings end-to-end; parse only for display/calc.

## Connects To
- **Digital Wallet**: extends these principles to 1M TPS with event sourcing.
- **Stock Exchange**: same exactly-once/determinism rigor.
- **Hotel Reservation System**: idempotency keys and payment handoff.
