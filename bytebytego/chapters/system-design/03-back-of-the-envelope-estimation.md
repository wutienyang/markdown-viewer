# 03: Back-of-the-envelope Estimation

## Core Idea
Estimate QPS, storage, and cache with rounded numbers and known latency/availability figures to quickly judge which designs meet requirements — the process matters more than precision.

## Design Framework / Approach
1. Know the building blocks: **power of two** units, **latency numbers every programmer should know**, and **availability numbers**.
2. Write down every assumption explicitly.
3. Compute in steps: DAU → QPS → peak QPS → storage over time.
4. Label units on every number to avoid ambiguity.
5. Round aggressively (e.g. `99987 / 9.1` → `100000 / 10`).

## Key Concepts & Components
- **Power of two units**: 1 KB ≈ 10³, 1 MB ≈ 10⁶, 1 GB ≈ 10⁹, 1 TB ≈ 10¹², 1 PB ≈ 10¹⁵ bytes.
- **Latency numbers**: L1 cache ~0.5 ns; main memory ref ~100 ns; compress 1KB ~10 µs; read 1 MB from memory ~250 µs; same-datacenter round trip ~500 µs; disk seek ~10 ms; read 1 MB from network ~10 ms; read 1 MB from disk ~30 ms; cross-continent round trip ~150 ms.
- **Peak QPS**: roughly 2× average QPS as a working rule.
- **Availability (nines)**: 99% ≈ 3.65 days/yr downtime; 99.9% ≈ 8.77 hrs/yr; 99.99% ≈ 52.6 min/yr; 99.999% ≈ 5.26 min/yr.
- **SLA**: formal uptime contract between provider and customer, usually 99.9% or higher.

## Trade-offs & Anti-patterns
- **Precision over process**: spending time on exact math wastes interview time; solve approximately.
- **Unlabeled units**: "5" alone is ambiguous — always write KB/MB/seconds.
- **Ignoring latency hierarchy**: forgetting that memory is fast and disk/network are slow leads to wrong design calls (avoid disk seeks; compress before sending over the wire).

## Key Takeaways
1. Memorize the latency table and the availability (nines) table — they anchor every estimation.
2. Practice the standard drills: QPS, peak QPS, storage, cache, and number of servers.
3. Write assumptions and units; round everything — estimation is about the reasoning path, not exact answers.

## Connects To
- **02-scale-from-zero-to-millions-of-users**: sizing the layers you add.
- **04-a-framework-for-system-design-interviews**: use estimation inside Step 2 to validate the blueprint.
- **09-design-a-url-shortener**: worked QPS/storage example (365B URLs, 36.5 TB).
