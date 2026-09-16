# 05: Pagination library

## Core Idea
Design a reusable, open-source pagination library that serves developers (not end users). The design centers on a generic `Paginator<T>` interface with native callbacks, a tiered in-memory + disk cache, priority-based scheduling, and modular async/versioning support.

## Design Framework / Approach
- **Public API**: `Paginator<T>` (generic) exposing `fetch`, `fetchAround`, `clear`; all idempotent; `key` is agnostic to technique (offset integer or cursor token). Return `PaginatorExecution` for cancellation.
- **Data propagation**: native callbacks (dependency-free core), not a mandated async framework.
- **Implementation**: `CallbackPaginator<T>` wired via dependency injection with `PaginatorDataSource`, `PageValidator`, optional `PaginatorStore`, and `PaginatorConfig` (concurrency, eviction).
- **Caching**: in-memory `PaginatorInMemoryCache` (Map<key, PaginatorPageResult>) + optional disk `PaginatorStore`; state modeled explicitly (Loading / Success / Error).
- **Priority scheduling**: `FetchPriority` (HIGH/MEDIUM/LOW) executed via a Priority Queue; `fetchAround` gets separate `keyPriority` vs `aroundPriority`.
- **Async compatibility**: `paginator-core` with no dependencies plus optional `paginator-coroutines` / `paginator-combine` / `paginator-rx` extensions.
- **Versioning**: Semantic Versioning (MAJOR.MINOR.PATCH); note data classes/structs break ABI/binary compat — prefer public classes in library models.

## Key Concepts & Components
- **Generics (`Paginator<T>`)**: one implementation handles any data type; compile-time type safety.
- **PaginatorPage<T>**: content + key + prevKey/nextKey + optional expirationTime.
- **PaginatorScheduler / PaginatorEvictor**: separate scheduling (queue/retry/debounce) and eviction concerns from the Paginator.
- **Eviction policies**: built-in LRU, FIFO, LIFO + custom (TTL, size, count).
- **Testing artifact**: pre-built test doubles + helpers shipped separately to keep core lightweight.

## Trade-offs & Anti-patterns
- **Data classes/structs in a library API**: generated methods/memory layout break binary compatibility — use public classes.
- **Static `Paginator.init(...)` config**: per-instance configuration is needed — prefer instance-level config.
- **Mandating Coroutines/Combine in the core**: forces RxJava apps to adopt foreign frameworks — isolate in extensions.
- **Separate queues per priority**: memory overhead vs a single priority queue's heap-reordering trade-off.

## Key Takeaways
1. Treat the library API as its UX; prioritize documentation, stability, and intuitive design.
2. Keep the core dependency-free and push async frameworks into optional modules.
3. Use a priority queue so user-initiated fetches outrank background prefetching.

## Connects To
- **02-news-feed-app**: cursor pagination (the technique this library abstracts).
- **09-mobile-system-design-building-blocks**: offset vs cursor trade-offs, caching, and modularization patterns.
