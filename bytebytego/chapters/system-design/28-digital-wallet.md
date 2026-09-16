# 28: Digital Wallet

## Core Idea
A 1M-TPS balance-transfer system built on **event sourcing**: store an immutable event log as the source of truth so every historical balance is reproducible for audit, made fast with file-based append-only storage and reliable with Raft replication.

## Design Framework / Approach
Progress through three designs: (1) Redis sharding (fast, not atomic/durable); (2) transactional DBs + distributed transactions (2PC / TC/C / Saga); (3) event sourcing with CQRS. Then optimize: local file + mmap for commands/events/state, snapshots for fast replay, Raft consensus for the event list, and TC/C or Saga to coordinate across shards.

## Key Concepts & Components
- **Command → Event → State → State machine**: commands are intentions (may fail); events are validated facts; state is balances; the state machine validates commands and applies events deterministically.
- **Reproducibility**: replay the immutable event list to reconstruct any historical balance — answers auditors.
- **CQRS**: one write state machine + many read-only state machines building views (balances, audit trails); eventually consistent.
- **2PC vs TC/C vs Saga**: 2PC locks until commit (not performant, SPOF coordinator); TC/C = Try/Confirm/Cancel compensation (parallelizable); Saga = linear ops with rollback (orchestration preferred for wallets).
- **Phase status table**: persists Try/Confirm/Cancel progress so a restarted coordinator can recover; includes out-of-order flag.
- **File-based + mmap**: append-only command/event lists on local disk with OS cache; RocksDB (LSM) for state; snapshots to HDFS.
- **Raft**: replicate only the event list (state/snapshot regenerate from it); leader converts commands to events, followers replay.

## Trade-offs & Anti-patterns
- **Redis for balances**: two-node updates aren't atomic and data isn't durable — no correctness.
- **2PC**: locks held across network waits kill performance; coordinator is a SPOF.
- **NOP-first / deposit-first Try orders**: let money be withdrawn before deposit; deduct first (choice 1) is the only valid order.
- **Event generation with I/O/randomness**: breaks determinism — the state machine must be pure.

## Key Takeaways
1. Event sourcing turns "what is the balance" into "replay the log" — the audit-grade answer.
2. Only the event list needs durability/replication; state and snapshots are derived.
3. Speed comes from file-based append-only writes + mmap; reliability from Raft-consensus replication.

## Connects To
- **Payment System**: same double-entry/exactly-once principles.
- **Stock Exchange**: event sourcing + determinism + Raft reuse.
- **Distributed Message Queue**: the event log mirrors WAL/append-only storage.
