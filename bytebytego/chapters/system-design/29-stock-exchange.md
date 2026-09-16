# 29: Stock Exchange

## Core Idea
A millisecond-latency matching engine whose correctness rests on **determinism** — a sequencer stamps order/execution sequences so the same inputs always reproduce the same fills, enabling hot-warm failover and replay.

## Design Framework / Approach
Three flows with different latency budgets: the **trading path** (gateway → order manager → sequencer → matching engine) is critical; market data and reporting are not. Optimize the critical path by collapsing components onto one server, replacing network/disk with an mmap message bus over `/dev/shm`, and pinning single-threaded application loops to CPU cores.

## Key Concepts & Components
- **Matching engine (cross engine)**: maintains per-symbol order books, matches buys/sells into two executions (fills), deterministic output.
- **Order book**: `Map<Price, PriceLevel>` of doubly-linked lists + `Map<OrderID, Order>`; O(1) add/cancel/match; best bid/ask lookup.
- **Sequencer**: stamps inbound orders and outbound fills with sequence IDs; doubles as event store; enables fairness, replay, exactly-once.
- **Client gateway**: validation, rate limiting, auth, normalization; colocation for institutional low latency.
- **Event sourcing**: immutable log of NewOrderEvent/OrderFilledEvent over an mmap event store; order manager becomes an embedded library.
- **Hot-warm failover**: warm engine replays same events, takes over on primary failure; Raft leader election across machines.
- **Market data**: L1/L2/L3 price levels; candlestick charts via ring buffers; market data publisher rebuilds order books.
- **Multicast / reliable UDP**: fair simultaneous market-data distribution; colocation for low-latency VIP access.

## Trade-offs & Anti-patterns
- **Network + disk on the critical path**: adds single-digit ms; eliminate via one-server + mmap `/dev/shm` to reach tens of µs.
- **Multi-threaded state with locks**: context switches and lock contention raise 99th-percentile latency — pin one thread per core.
- **Multiple sequencers**: fight to write the event store; keep a single writer.
- **O(n) list for order book**: plain list makes cancel/match O(n); use a doubly-linked list for O(1).

## Key Takeaways
1. Determinism (sequencer + event sourcing) is the foundation of a highly available exchange — replay reproduces state.
2. Latency reduction = fewer critical-path tasks + eliminate network/disk (mmap, CPU pinning, colocation).
3. The order book (doubly-linked price levels) is the core data structure that must be O(1).

## Connects To
- **Digital Wallet**: event sourcing, determinism, Raft.
- **Payment System**: exactly-once, reconciliation.
- **Real-time Gaming Leaderboard**: ranked in-memory structures; contrasting latency vs. throughput priorities.
