# Cheatsheet — ByteByteGo Interview Prep

Decision rules for acting like the author. Companion to `patterns.md` (definitions) and `glossary.md` (terms).

## System Design

### Pick the right primitive

| Decision | Use | Avoid |
| --- | --- | --- |
| Partition servers that change | Consistent hashing + virtual nodes | `hash % N` |
| Rate-limit bursty traffic | Token bucket | Fixed window (edge spikes) |
| Rate-limit accuracy + low memory | Sliding window counter | Sliding window log (memory) |
| 64-bit time-sortable IDs | Snowflake layout | UUID (128-bit, unsorted) |
| Short URL generation | Base 62 of unique ID | Hash + collision (unpredictable next ID) |
| Chat receive protocol | WebSocket | Polling / long polling |
| Chat history storage | Key-value store | Relational (long-tail) |
| Video content delivery | CDN (popular only) | CDN for long-tail (cost) |
| Read-heavy hot data | Cache + CDN | Repeated DB hits |

### Pick the right mechanism

| Need | Use |
| --- | --- |
| Rank millions of users in real time | Redis sorted set (ZADD/ZINCRBY/ZREVRANK) |
| Find things within a radius | geohash (simple) / quadtree (k-nearest) / S2 (geofence) |
| Ordered, high-throughput message log | WAL + partitions + consumer groups |
| Durable but cheap cold storage | object storage + erasure coding |
| Guarantee no double payment | idempotency key + DB unique constraint |
| Guarantee financial correctness over time | double-entry ledger + reconciliation |
| Prove historical balances | event sourcing (replay) |
| Cut retention cost | downsampling tiers (raw → 1m → 1h) |
| Handle late events in aggregation | event time + watermark |
| Eliminate network/disk on critical path | one server + mmap + CPU pinning |

### Estimation anchors
Latency: L1 0.5 ns · memory 100 ns · 1 MB from memory 250 µs · same-DC round trip 500 µs · disk seek 10 ms · 1 MB from disk 30 ms · cross-continent 150 ms.
Availability: 99% = 3.65 d/yr · 99.9% = 8.77 h/yr · 99.99% = 52.6 min/yr · 99.999% = 5.26 min/yr.
Peak QPS ≈ 2× average.

## Coding Patterns

### Recognize the pattern

| Problem asks for... | Use pattern |
|---|---|
| Pair/triplet that sums to target, sorted array | Two Pointers |
| Pair summing to target, unsorted | Hash Maps And Sets |
| Reverse/remove/find node, no random access | Linked Lists |
| Detect cycle or find middle of a list | Fast And Slow Pointers |
| Longest/shortest substring or fixed-length subarray | Sliding Windows |
| First/last/insertion position or search sorted/rotated | Binary Search |
| Validate nesting or "next larger/smaller" | Stacks |
| Top-k, k-way merge, running median | Heaps |
| Merge/find overlaps, max concurrency | Intervals |
| Range sum/product queries, count subarrays = k | Prefix Sums |

### Pick the algorithm

| Goal | Algorithm | Complexity |
|---|---|---|
| Shortest path, unweighted | BFS / multi-source BFS | O(n+e) / O(n) |
| Shortest path, non-negative weights | Dijkstra (min-heap) | O((n+e)log n) |
| Cycle in directed graph | Kahn's topological sort | O(n+e) |
| Connectivity / merging / MST cycle-skip | Union-Find (path compression + union-by-size) | amortized O(1) |
| Minimum spanning tree | Kruskal (sort + Union-Find) | O(E log E) |
| All permutations / subsets / combinations | Backtracking | O(n·n!) / O(n·2^n) |
| kth largest | quickselect (O(n) avg) or min-heap of k | O(n log k) |
| Duplicate / unique element | XOR all elements | O(n) / O(1) |
| Prefix/autocomplete | Trie | O(k) per word |
| Longest common subsequence | 2D DP | O(m·n) |
| Max subarray sum | Kadane's | O(n) / O(1) |
| Collinearity | GCD-reduced (rise, run) slope buckets | O(n² log m) |

## Machine Learning System Design

- **Ranking offline metric pick**: binary relevance → mAP; graded relevance → nDCG; one-relevant-item → MRR.
- **Classification offline metric pick**: precision/recall alone insufficient → use ROC-AUC **and** PR-AUC.
- **Object detection metric pick**: report AP (per class) and mAP (across classes), never single-threshold precision.
- **Model for sparse high-cardinality features**: FM / DeepFM / DCN, not plain NN or LR.
- **Model for structured tabular baseline**: XGBoost/GBDT (but swap to NN if continual learning required).
- **Model for images/text**: ResNet/ViT (images), BERT/DistilmBERT (text), CLIP (multimodal).
- **New-user cold-start**: rely on demographic/context features via two-tower or NN.
- **New-item cold-start**: heuristic embedding (nearby/random exposure) until interactions accrue, then fine-tune.
- **Label strategy**: natural labels (clicks/reports) for training; hand labels for evaluation.
- **Class imbalance**: focal loss / class-balanced loss, or under/over-sample.
- **Latency tactic**: batch prediction when results can be precomputed; online when inputs unknown ahead of time.

## Generative AI

### Choose a Transformer variant

| Task | Variant |
| --- | --- |
| Text completion / chatbot | decoder-only |
| Sentiment / classification | encoder-only |
| Translation / captioning | encoder-decoder |

### Choose an image-generation approach

| Need | Approach |
| --- | --- |
| Fast + latent editing (faces) | GAN |
| High-res in seconds | Autoregressive (VQ-VAE + Transformer) |
| Peak quality from text | Diffusion |
| Compression / compact latent | VAE |

### Sampling decision rules
- Predictable, short, consistent output → **beam search** (email, translation, captioning).
- Open-ended dialogue → **top-p + temperature** (~0.5–1.0); code gen → low temperature + low top-p.

### Customize an LLM for domain data
- Changing/evolving corpus, need citations → **RAG**.
- Deep domain specialization, static data → **finetuning (LoRA)**.
- Quick experiments, no retraining → **prompt engineering**.

### Evaluation metric by task

| Task | Offline metric |
| --- | --- |
| Language model | perplexity |
| Translation | BLEU, ROUGE, METEOR |
| Captioning | CIDEr |
| Image quality/diversity | Inception score, FID |
| Image–text alignment | CLIPScore |
| Video | FVD + CLIP similarity |

### GAN instability mitigations
- Vanishing gradients → modified minimax / Wasserstein loss.
- Mode collapse → Wasserstein loss / Unrolled GAN.
- Non-convergence → normalization, differing LRs, regularization, input noise.

## Mobile System Design

| Decision | Default choice | When to deviate |
|---|---|---|
| Client↔server protocol | HTTP + REST + JSON | gRPC/Protobuf for performance-critical; WebSocket only for real-time push |
| Pagination | Cursor-based | Offset only for small, stable datasets |
| Local data store | Relational DB (SQLite/Room/Core Data) | Key-value for prefs; Keystore/Keychain for secrets |
| Money/decimal types | BigDecimal / Decimal | Never Float/Double |
| Real-time display | Buffered updates | Direct updates if single low-frequency source |
| HTML content | Store HTML, render native | WebView only for complex/non-scroll contexts |
| Payments | Client PSP SDK + tokenization | Direct processor only with PCI DSS commitment |
| App upgrades | Soft upgrade → tiered → hard | Hard immediately for security/compliance breaking changes |
| Prefetching | Intelligent (signal-driven) | Time/event-based only for simplicity at small scale |
| Message/order identity | Server-generated ID | Client timestamp only for pending messages |

## Object-Oriented Design

| Situation | Choose |
|---|---|
| Interchangeable pricing/rules | Strategy Pattern |
| One clean client API over many classes | Facade Pattern |
| Nested AND/OR conditions | Composite Pattern |
| Enforce action order | State Pattern |
| Event-driven notifications | Observer Pattern |
| Undo / rollback | Memento Pattern |
| Stack runtime behavior | Decorator Pattern |
| Currency values | BigDecimal or integer cents (never float/double) |
| Card values / size / direction | Enum (type-safe, never strings/ints) |
| Flexible seat grid | Nested Map (over 2D array) |
| Ordered strategy application | List (over Set, which loses order) |
| Deep directory traversal | Explicit stack (over recursion) |
| High-contention seat booking | Pessimistic locking + timeout |
| Low-contention seat booking | Optimistic locking |
| Draw without shifting | nextCardIndex pointer (over list remove) |
| Multiple ace totals | Precompute all possible hand values |

## Resume

- **Goal**: get the interview for *that* job in under 10 seconds — not document your career.
- **Ground rules**: no typos, reverse-chronological dates, PDF named `{yourname}_resume.pdf`, ≤2 pages (1 for new grads).
- **Always on page one**: years of experience, relevant technologies, recent roles, and location/visa status.
- **Remove**: photos, DOB/gender/citizenship, spoken languages, references, self-rated skill levels, >4 contact links, stale links.
- **Every bullet**: a number + active verb + your specific contribution; use "I", not "we".
- **Structure by level**: grads → internships/projects/education; experienced → work experience + technologies first; senior → summary + impact/influence, education last.
- **Tailor per job**: mirror the job description's keywords and languages; generalist vs. specific-technology companies want different things.
- **Template**: single-column, top-down, consistent bolding/color; avoid two-column and Europass.
- **Before applying**: ask for a referral; use job aggregators; list and prioritize target companies.
- **Beyond the resume**: optimize LinkedIn headline for what you want to be found for; curate GitHub/blog to only link what sells you.
