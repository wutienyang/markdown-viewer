# Patterns — ByteByteGo Interview Prep

Concrete techniques and design patterns, grouped by book.

## System Design Interview

### Consistent Hashing
**When to use**: Partitioning data/requests across servers that can be added or removed (sharding, caches, downloaders).
**How**: Hash servers and keys onto a ring; route clockwise to the first server/virtual node.
**Trade-offs**: Only ~k/n keys remap on change vs. naive `hash % N`; virtual nodes add memory cost for better balance.

### Quorum Consensus
**When to use**: Tuning consistency vs latency in a replicated store.
**How**: Configure N (replicas), W (write acks), R (read responses); W+R>N ⇒ strong consistency.
**Trade-offs**: Higher W/R = stronger consistency but slower (wait for slowest replica); W=1/R=N favors fast writes, R=1/W=N favors fast reads.

### Hybrid Fanout
**When to use**: News feeds / timelines with a mix of ordinary and celebrity users.
**How**: Push (fanout on write) for most users; pull (fanout on read) for high-follower users.
**Trade-offs**: Push gives fast reads but hotkey risk for celebrities; pull is slower but avoids wasted work for inactive users.

### Message-Queue Decoupling
**When to use**: Asynchronous work, burst absorption, and isolating downstream failures (notifications, video transcoding, fanout).
**How**: Producers publish events; workers consume and process independently; one queue per downstream channel.
**Trade-offs**: Adds eventual-consistency latency and queue depth to monitor; buys fault isolation and independent scaling.

### Trie with Top-k Caching
**When to use**: Prefix autocomplete / typeahead requiring <100 ms responses.
**How**: Cache top-k queries at each trie node; rebuild the trie offline from aggregated logs.
**Trade-offs**: Space-for-time (storing top-k per node); offline rebuilds lag real-time trends.

### Block-Sync Upload (Google Drive)
**When to use**: file storage/sync where files are large and frequently edited.
**How**: chunk into ~4MB blocks, hash each, dedup identical blocks, compress + encrypt, upload only changed blocks (delta sync).
**Trade-offs**: saves bandwidth and storage; requires block server + strong metadata consistency; client-side encryption is a security risk.

### Redis Pub/Sub Fan-out (Nearby Friends)
**When to use**: broadcasting a frequently-updated value (location) to a dynamic set of subscribers.
**How**: one channel per user; friends subscribe; handlers recompute distance and forward within radius. Scale channels via consistent hashing.
**Trade-offs**: CPU-bound not memory-bound; subscribe-to-all trades memory for simplicity; resizing causes resubscription storms.

### WAL Segment Log (Message Queue / Object Store)
**When to use**: append-heavy, sequential, high-throughput durable storage.
**How**: append records to an active segment/file; rotate at a size cap; old segments become read-only and later truncated.
**Trade-offs**: exploits sequential disk I/O + OS cache; needs a separate mapping for random lookup.

### Stream Aggregation DAG (Ad Click)
**When to use**: real-time grouping/counting over unbounded event streams.
**How**: Map (partition/normalize) → Aggregate (per-window in-memory) → Reduce (merge), over Kafka; event time + watermark.
**Trade-offs**: near-real-time vs accuracy; keep raw data for replay/reconciliation.

### Distributed Transaction (Hotel / Wallet)
**When to use**: atomic multi-node writes without heavy locking.
**How**: 2PC (lock until commit), TC/C (Try/Confirm/Cancel compensation), or Saga (linear + compensating rollback).
**Trade-offs**: 2PC is not performant; TC/C parallel but sees unbalanced states; Saga linear but simpler.

### Event Sourcing + CQRS (Wallet / Exchange)
**When to use**: auditable, reproducible financial state.
**How**: append validated events to an immutable log; state machines derive state; read models are separate projections.
**Trade-offs**: full audit/replay and determinism; read side is eventually consistent; needs snapshotting for replay speed.

## Coding Interview Patterns

### Two Pointers
**When to use**: linear structure with predictable dynamics (sorted array, palindrome) or asking for a pair of values.
**How**: place pointers (inward/unidirectional/staged) and move them based on comparison results.
**Trade-offs**: O(n) vs O(n²) brute force; requires sortable/predictable input.

### Hash Maps And Sets
**When to use**: constant-time lookups — frequency, uniqueness, duplicates, key→value mapping.
**How**: store value→index or value→frequency; use complement or "seen" checks.
**Trade-offs**: O(1) average operations but O(n) space; worst-case O(n) on collisions.

### Linked Lists
**When to use**: node/pointer-based structures with no random access; reversal, removal, merging, restructuring.
**How**: manipulate `next`/`prev` pointers, use dummy nodes, compose subroutines.
**Trade-offs**: O(1) insert/delete vs O(n) random access; easy to lose references.

### Fast And Slow Pointers
**When to use**: cycle detection, midpoint, or any traversable sequence with a "next" step.
**How**: slow moves 1 step, fast 2; detect meeting or end condition.
**Trade-offs**: O(1) space cycle detection vs O(n) hash set; works only on traversable sequences.

### Sliding Windows
**When to use**: subarray/substring problems; fixed-length or longest/shortest satisfying a condition.
**How**: expand right, shrink/slide left, maintain incremental window state.
**Trade-offs**: O(n) vs O(n²) nested loops; window state must be updatable in O(1).

### Binary Search
**When to use**: sorted data or a monotonic true/false predicate over a search space.
**How**: define space, narrow via midpoint, exit on `left < right`, return converged value.
**Trade-offs**: O(log n); fiddly off-by-one and infinite-loop edge cases.

### Stacks
**When to use**: LIFO order — nested structures, reversal, "next larger/smaller."
**How**: push/pop top; monotonic stacks pop order-breakers.
**Trade-offs**: O(1) ops; single-end access — need a deque for both ends.

### Heaps
**When to use**: repeated min/max of a dynamic set; top-k, k-way merge, running median.
**How**: push/pop/peek; two heaps split halves; cap size k for bounded top-k.
**Trade-offs**: O(log n) ops vs O(n) sort; O(k) or O(n) space.

### Intervals
**When to use**: start/end ranges; overlap, merge, concurrency/scheduling.
**How**: sort by start; test `A.end >= B.start`; sweep-line for active counts.
**Trade-offs**: O(n log n) sort dominates; clarify open/closed endpoints.

### Prefix Sums
**When to use**: repeated range queries or counting subarrays by sum/product.
**How**: precompute cumulative array; query via difference; map for complement.
**Trade-offs**: O(1) query after O(n) precompute; O(n) space.

### Trees
**When to use**: Hierarchical data, a root node is given, or tree-shaped structures (filesystems, XML).
**How**: Pick traversal by order of processing — preorder (root-first), inorder (sorted/BST), postorder (bottom-up), BFS/level-order (per-level).
**Trade-offs**: DFS uses call-stack space O(h); BFS uses queue space O(n). BST gives sorted inorder and bounded values.

### Tries
**When to use**: Efficient prefix search, autocomplete, dictionary validation, or wildcard matching over many shared-prefix strings.
**How**: Node = children map + end-of-word marker; walk characters, create missing nodes, mark terminal.
**Trade-offs**: O(k) per word independent of dictionary size, but higher space than a hash set of words.

### Graphs
**When to use**: Relationships, networks, reachability, dependencies, grids of connected cells.
**How**: Build an adjacency list, track visited; BFS for unweighted shortest path, Dijkstra for weighted, Kahn's for ordering/cycles, Union-Find for connectivity.
**Trade-offs**: BFS/Dijkstra need a queue/heap; Union-Find is near-constant but only answers connectivity.

### Backtracking
**When to use**: Enumerate ALL solutions — permutations, subsets, combinations, placements.
**How**: DFS over a state space tree: make decision → recurse → undo; prune invalid branches.
**Trade-offs**: Exponential time, but linear recursion depth; correctness by exhaustiveness.

### Dynamic Programming
**When to use**: Optimal substructure + overlapping subproblems; keywords min/max/ways/longest.
**How**: Define subproblem → recurrence → base cases → fill bottom-up (or memoize top-down), then space-optimize.
**Trade-offs**: Polynomial time vs brute force, at the cost of extra table/memo space.

### Greedy
**When to use**: A provable local-optimal choice leads to the global optimum (optimization problems).
**How**: Make the best immediate decision, never revisit; verify the greedy choice property.
**Trade-offs**: O(n)/O(1) often, but incorrect if the greedy choice property doesn't hold (fall back to DP).

### Sort And Search
**When to use**: Ordering elements or finding a kth order statistic.
**How**: Quicksort (in-place, unstable), merge sort (stable, lists), counting sort (bounded range), quickselect or k-heap for kth.
**Trade-offs**: Comparison sorts Ω(n log n); non-comparison sorts O(n+k) when range is bounded.

### Bit Manipulation
**When to use**: Duplicates/pairs, parity, bitmasks for compact state, or explicit bit-level tasks.
**How**: XOR for cancellation; masks + shifts to extract/move/merge bit fields.
**Trade-offs**: O(1) time/space and fast, but less readable; mask width must match integer size.

### Math And Geometry
**When to use**: Numeric/geometric reasoning — GCD, modular arithmetic, overflow, slopes, patterns.
**How**: Reduce to canonical forms (GCD-reduced fractions), guard overflow before the op, collapse patterns to O(1) rules.
**Trade-offs**: Closed-form O(1) solutions, but require spotting the mathematical identity.

## Machine Learning System Design Interview

### Multi-stage candidate generation → scoring → re-ranking
**When to use**: item corpus is huge (billions) and latency is tight (~200ms).
**How**: lightweight two-tower narrows to thousands via ANN; heavy feature-rich model ranks; re-ranking applies business rules/diversity.
**Trade-offs**: more moving parts to maintain; the coarse stage trades precision for speed, so it must over-generate candidates.

### Two-tower embedding retrieval
**When to use**: search/recommendation where relevance can be encoded as embedding distance.
**How**: train user/query and item encoders jointly with contrastive loss; serve via ANN.
**Trade-offs**: fast serving but two-tower ignores cross-feature interactions available to a single fused model.

### Pointwise LTR via binary classification
**When to use**: ranking where you can define a positive/negative label per query-item pair.
**How**: predict P(engage) per pair, sort, apply business logic in re-ranking.
**Trade-offs**: simpler than pairwise/listwise but ignores relative ordering of items during training.

### Multi-task DNN with shared layers
**When to use**: multiple correlated prediction targets (harm classes, reaction types) with shared features.
**How**: shared hidden layers + per-task classification heads; combine per-task losses.
**Trade-offs**: shares data across tasks and is cheap to maintain, but requires balancing loss magnitudes across tasks.

### Continual-learning-friendly model choice
**When to use**: streaming data where a stale model loses accuracy fast (ads, events, feeds).
**How**: prefer neural networks (fine-tunable) over GBDT (retrain from scratch).
**Trade-offs**: NNs are costlier and less interpretable than GBDT; use GBDT as a fast baseline only.

## Generative AI System Design Interview

### Two-Stage Training (pretrain → finetune)
**When to use**: most generative tasks with limited task-specific data.
**How**: pretrain on large general corpus (next-token prediction or MLM), then finetune on task data.
**Trade-offs**: pretraining is expensive but reusable; finetuning is fast and mitigates overfitting.

### Three-Stage LLM Training (pretrain → SFT → RLHF)
**When to use**: chatbots needing instruction-following plus safety/helpfulness.
**How**: pretrain for language, SFT on (prompt, response) pairs, RLHF with a reward model + PPO.
**Trade-offs**: RLHF requires expensive preference labeling and a separate reward model.

### Encoder-Decoder for seq2seq / multimodal
**When to use**: translation, captioning — output is a transformation of input.
**How**: encoder (bidirectional) → decoder (causal + cross-attention) → prediction head.
**Trade-offs**: separates understanding from generation; heavier than decoder-only.

### RAG Pipeline
**When to use**: answering from large, evolving, referenced knowledge bases.
**How**: parse → chunk → embed (CLIP) → vector DB; retrieve via ANN; generate with prompt engineering.
**Trade-offs**: quality bounded by retrieval; complex to build; prefer over finetuning for changing data.

### Adversarial Training (GAN)
**When to use**: fast, controllable image generation with latent-space editing.
**How**: alternate generator/discriminator training with minimax loss.
**Trade-offs**: unstable (mode collapse, vanishing gradients) — stabilize with Wasserstein loss + normalization.

### Two-Stage Autoregressive Image Generation
**When to use**: high-res image generation in seconds.
**How**: VQ-VAE tokenizer (encode/decode) + decoder-only Transformer generating tokens.
**Trade-offs**: faster than pixel diffusion but slower than GAN/VAE; needs perceptual + adversarial losses.

### Diffusion Training + Sampling
**When to use**: highest-quality image/video generation from text.
**How**: predict added noise (MSE) in forward/backward process; sample with CFG + DDIM.
**Trade-offs**: multi-step sampling is slow — mitigate with latent diffusion, distillation, quantization.

### Personalization by Finetuning
**When to use**: subject-driven generation (headshots, product shots).
**How**: DreamBooth (full) / LoRA (low-rank) / textual inversion (token only) on reference images.
**Trade-offs**: fidelity vs. storage/training cost — DreamBooth most effective, LoRA most compact.

### Latent Diffusion for Video
**When to use**: text-to-video generation at scale.
**How**: VAE compresses video to latent; DiT (+ temporal layers) denoises; decoder reconstructs.
**Trade-offs**: ~512× cheaper than pixel space; requires precomputed latents and super-resolution.

## Mobile System Design Interview

### Offline-first + SSOT
**When to use**: apps that must work with spotty connectivity (feeds, chat, drive).
**How**: make a local relational DB the SSOT; repositories expose a DB-backed stream; network responses write through the DB; queue mutations locally and flush on reconnect.
**Trade-offs**: needs eviction + conflict resolution; more client complexity, but resilient UX.

### Hybrid HTTP + WebSocket
**When to use**: apps with both client-initiated actions and server-pushed real-time events (chat, trading).
**How**: REST for sends/CRUD; WebSocket only for real-time pushes; scope the socket narrowly to control scaling.
**Trade-offs**: two protocols to maintain; WebSocket persistent connections are hard to load-balance and scale.

### Optimistic writes + interaction queue
**When to use**: like/share/send where instant feedback drives engagement.
**How**: update UI state immediately; persist a `UserInteraction`/`MessageRequest` row; retry with exponential backoff; roll back or notify on terminal failure.
**Trade-offs**: risk of client/backend divergence; requires conflict resolution ("last write wins", merge, or user decision).

### Buffered real-time UI
**When to use**: high-frequency streaming data (stock prices, charts).
**How**: queue incoming events, flush via a scheduled updater (1-2s), push through a JS bridge to WebView; partial redraws.
**Trade-offs**: small display delay; misses intermediate ticks; needs interval tuning.

### Resumable chunked upload
**When to use**: large files (multi-MB/GB) on unreliable networks.
**How**: initiate session → PUT chunks with Content-Range → resume via session lookup; persist session to survive OS termination.
**Trade-offs**: extra round-trips and client state; worth it for large/remote transfers.

## Object-Oriented Design Interview

### Strategy Pattern
**When to use**: runtime selection of algorithms; replacing conditional logic; pricing/calc/decision rules that vary.
**How**: define an interface (e.g., `FareStrategy`, `PricingStrategy`), one class per behavior, and a context that holds the chosen strategy.
**Trade-offs**: more classes/indirection; requires a stable contract — but adds new behaviors without touching existing code (OCP).

### Facade Pattern
**When to use**: a subsystem with many components; want one unified client entry point.
**How**: a thin coordinator class delegates to managers/processors (e.g., `ParkingLot` → `ParkingManager` + `FareCalculator`).
**Trade-offs**: can become a god object if not kept thin — delegate aggressively.

### Composite Pattern
**When to use**: tree-like structures or nested logical combinations treated uniformly.
**How**: common interface with leaf (simple) and composite (AND/OR) nodes evaluated recursively.
**Trade-offs**: uniform treatment hides node type; can complicate per-node logic.

### State Pattern
**When to use**: strict action sequences and per-state messages (vending machine, turn phases).
**How**: context holds a current state object; each state enforces legal transitions.
**Trade-offs**: class proliferation; but removes sprawling conditionals.

### Observer Pattern
**When to use**: event-driven decoupling where a subject's change must notify many subscribers.
**How**: subject maintains observers and calls `update()`; dispatch controller subscribes to button panels.
**Trade-offs**: loose coupling at the cost of indirection and potential notification storms.

### Memento Pattern
**When to use**: undo/rollback needing state snapshots.
**How**: originator creates memento, caretaker stores a LIFO stack, restore pops and reverts.
**Trade-offs**: memory overhead grows with state size.

### Decorator Pattern
**When to use**: layering/stacking behavior at runtime without subclass explosion.
**How**: decorator implements the same interface and wraps another instance, adding behavior.
**Trade-offs**: many small wrappers; ordering can matter.

## How to Write a Good Resume

### Yes/Maybe/No Triage
**When to use**: When a recruiter or manager must quickly reduce hundreds of resumes to a handful to interview.
**How**: Sort into a Yes pile (≤5, immediately interviewed), a Maybe pile (≤5, backups), and a No pile (actively look for reasons to reject). Re-read Maybe after phone-screening Yes candidates.
**Trade-offs**: Fast but noisy — genuinely strong candidates with weak resumes land in Maybe/No.

### Results / Impact / Contribution bullet
**When to use**: When writing any work-experience or project bullet on a resume.
**How**: "Accomplished {impact} as measured by {number} by doing {specific contribution}." Use numbers, active verbs, and name technologies near the end.
**Trade-offs**: Requires digging up or estimating real metrics; over-quantifying trivial work looks hollow.

### Master resume + per-job tailoring
**When to use**: When applying to multiple distinct roles.
**How**: Keep one long master resume, then trim and mirror each job description's language and keywords into a dedicated version per application.
**Trade-offs**: More effort per application, but it's the single highest-impact change; never submit contradictory versions to the same company.

### Tailored cover letter (small companies only)
**When to use**: Only for smaller companies/startups or when you can reach the hiring manager directly.
**How**: Write a short, company-first, personalized letter: show communication skill, understanding of the role, fit, and that you read their site; attach as PDF.
**Trade-offs**: Big tech rarely reads them; a templated letter gets ignored. Tone must match region/company.
