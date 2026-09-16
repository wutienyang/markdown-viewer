---
name: bytebytego
description: "Knowledge base from ByteByteGo's interview-prep series (System Design Interview by Alex Xu, Coding Interview Patterns, Machine Learning / Generative AI / Mobile / Object-Oriented System Design Interview, How to Write a Good Resume). Use when preparing for or running technical interviews, designing systems, applying coding patterns, or writing a resume."
---

<!-- argument-hint: [topic, framework name, book, or chapter number] -->

# ByteByteGo Interview Prep
**Source**: ByteByteGo (Alex Xu et al.) | **Books**: 7 | **Chapters**: 106 | **Generated**: 2026-09-16

## How to Use This Skill

- **Without arguments** — load the core frameworks below for reference
- **With a topic** — ask about `consistent hashing`, `two-tower`, `RAG`, `sliding window`, `SOLID`, `resume structure`, or any indexed topic; I find and read the relevant chapter
- **With a book** — ask for `system design`, `coding patterns`, `ml`, `genai`, `mobile`, `ood`, or `resume` to see that book's chapter index
- **With a chapter** — ask for `ch05` within a book (e.g. "system design ch05"); I load that chapter file
- **Browse** — ask "what chapters do you have?" to see the full index

Chapters live under `chapters/<book>/<slug>.md`. When you ask about a topic not in Core Frameworks below, I read the relevant chapter file before answering.

---

## Core Frameworks & Mental Models

**System design interviews (4-step framework).** Scope the problem (clarify requirements, estimate scale), propose a high-level design and get buy-in, deep-dive the 2–4 most important components, then wrap up (bottlenecks, failure). The final design matters less than the reasoning you show; drive it with back-of-the-envelope estimation (peak QPS ≈ 2× average; know the latency anchors: memory 100 ns, disk seek 10 ms, cross-continent 150 ms).

**The recurring building blocks.** Partition servers that change with **consistent hashing + virtual nodes** (never `hash % N`). Tune replication with **quorum** (W+R>N ⇒ strong consistency). Decouple bursts with **message queues**; make writes fast and durable with **WAL**; guarantee exactly-once-ish money with **idempotency keys** and **double-entry ledgers**; serve reads with **cache + CDN**; rank/autocomplete with **trie + top-k**, **sorted sets/skip lists**; store blobs with **erasure coding**; spatial search with **geohash/quadtree/S2**.

**Coding interview patterns — recognize, then apply.** Match the problem shape to one of 19 patterns: pair/triplet on sorted arrays → **two pointers**; unsorted lookups/frequency → **hash map/set**; cycle/middle → **fast & slow pointers**; subarray/substring → **sliding window**; sorted or monotonic predicate → **binary search**; nesting/"next larger" → **stack**; top-k/median → **heap**; merge/overlap → **intervals**; range queries → **prefix sum**; hierarchical → **trees**; prefix search → **trie**; relationships/reachability → **graphs** (BFS/Dijkstra/Union-Find/topological sort); enumerate all → **backtracking**; min/max/ways/optimal → **dynamic programming**; provable local choice → **greedy**.

**ML system design (7-step framework).** Clarify requirements → define the **ML objective/problem framing** → data prep → feature engineering → model selection → evaluation (offline + online) → deployment/monitoring. Structure ranking as **candidate generation → scoring → re-ranking**; encode relevance as embedding distance with a **two-tower model** served by **ANN**. Pick metrics by task: binary relevance → mAP, graded → nDCG, one-hit → MRR; use ROC-AUC **and** PR-AUC for classification.

**GenAI — pick the transformer and the customization strategy.** Text completion/chat → **decoder-only**; classification → **encoder-only**; translation/captioning → **encoder-decoder**. Align a chatbot with **pretrain → SFT → RLHF**. Choose generation by quality/speed trade-off: **GAN** (fast, editable), **autoregressive VQ-VAE** (high-res in seconds), **diffusion** (peak quality). Customize for domain data by the data's nature: evolving/needs-citations → **RAG**; static/deep → **finetuning (LoRA)**; quick → **prompt engineering**.

**Mobile system design.** Follow the same 5-step framework but anchor on mobile constraints (battery, bandwidth, offline). Make a local DB the **single source of truth (SSOT)** with **offline-first** reads; use **cursor pagination**, **optimistic writes** with a retry queue, and **buffered updates** for high-frequency streams. Default HTTP+REST/JSON; WebSocket only for real-time push.

**Object-oriented design.** Gather requirements → define core objects → sketch relationships → apply **SOLID** and pick a design pattern: interchangeable rules → **Strategy**; one client API → **Facade**; nested AND/OR → **Composite**; action order → **State**; event notifications → **Observer**; undo → **Memento**; runtime stacking → **Decorator**.

**Resume writing.** The resume's job is to earn an interview for *that* job in under 10 seconds. Every bullet uses **"Accomplished {impact} as measured by {number} by doing {contribution}"** — a number + active verb + your specific contribution. Single-column, reverse-chronological, PDF named `{name}_resume.pdf`, ≤2 pages; tailor per job by mirroring the description's keywords.

---

## Chapter Index

### System Design Interview (Alex Xu)

| # | Title | Key Frameworks |
|---|-------|----------------|
| [02](chapters/system-design/02-scale-from-zero-to-millions-of-users.md) | Scale From Zero To Millions Of Users | single server → DB, cache, CDN, scaling |
| [03](chapters/system-design/03-back-of-the-envelope-estimation.md) | Back-of-the-envelope Estimation | estimation, QPS, storage math |
| [04](chapters/system-design/04-a-framework-for-system-design-interviews.md) | A Framework For System Design Interviews | 4-step framework, scope, buy-in |
| [05](chapters/system-design/05-design-a-rate-limiter.md) | Design A Rate Limiter | rate limiting, token bucket, Redis |
| [06](chapters/system-design/06-design-consistent-hashing.md) | Design Consistent Hashing | consistent hashing, virtual nodes, hash ring |
| [07](chapters/system-design/07-design-a-key-value-store.md) | Design A Key-value Store | CAP, quorum, vector clocks |
| [08](chapters/system-design/08-design-a-unique-id-generator-in-distributed-systems.md) | Design A Unique ID Generator In Distributed Systems | snowflake, UUID, ticket server |
| [09](chapters/system-design/09-design-a-url-shortener.md) | Design A URL Shortener | base 62, hash, 301 redirect |
| [10](chapters/system-design/10-design-a-web-crawler.md) | Design A Web Crawler | URL frontier, politeness, dedupe |
| [11](chapters/system-design/11-design-a-notification-system.md) | Design A Notification System | message queues, APNS/FCM, at-least-once |
| [12](chapters/system-design/12-design-a-news-feed-system.md) | Design A News Feed System | fanout push/pull, feed cache |
| [13](chapters/system-design/13-design-a-chat-system.md) | Design A Chat System | WebSocket, presence, KV store |
| [14](chapters/system-design/14-design-a-search-autocomplete-system.md) | Design A Search Autocomplete System | trie, top-k, aggregation |
| [15](chapters/system-design/15-design-youtube.md) | Design YouTube | transcoding, DAG, CDN cost |
| [16](chapters/system-design/16-design-google-drive.md) | Design Google Drive | block storage, delta sync, long polling |
| [17](chapters/system-design/17-proximity-service.md) | Proximity Service | geohash, quadtree, spatial index |
| [18](chapters/system-design/18-nearby-friends.md) | Nearby Friends | Redis pub/sub, WebSocket, consistent hashing |
| [19](chapters/system-design/19-google-maps.md) | Google Maps | map tiling, routing tiles, A* pathfinding |
| [20](chapters/system-design/20-distributed-message-queue.md) | Distributed Message Queue | WAL, partitions, consumer group, ISR |
| [21](chapters/system-design/21-metrics-monitoring-and-alerting-system.md) | Metrics Monitoring and Alerting System | time-series DB, downsampling, pull vs push |
| [22](chapters/system-design/22-ad-click-event-aggregation.md) | Ad Click Event Aggregation | MapReduce DAG, watermark, exactly-once |
| [23](chapters/system-design/23-hotel-reservation-system.md) | Hotel Reservation System | optimistic locking, idempotency key, saga |
| [24](chapters/system-design/24-distributed-email-service.md) | Distributed Email Service | denormalization, inverted index, deliverability |
| [25](chapters/system-design/25-s3-like-object-storage.md) | S3-like Object Storage | erasure coding, WAL, metadata sharding |
| [26](chapters/system-design/26-real-time-gaming-leaderboard.md) | Real-time Gaming Leaderboard | sorted set, skip list, sharding |
| [27](chapters/system-design/27-payment-system.md) | Payment System | double-entry ledger, idempotency, reconciliation |
| [28](chapters/system-design/28-digital-wallet.md) | Digital Wallet | event sourcing, CQRS, Raft |
| [29](chapters/system-design/29-stock-exchange.md) | Stock Exchange | matching engine, sequencer, determinism |

### Coding Interview Patterns

| # | Title | Key Frameworks |
|---|-------|----------------|
| [01](chapters/coding-patterns/01-two-pointers.md) | Two Pointers | two-pointer, sorted array, pair/triplet sum |
| [02](chapters/coding-patterns/02-hash-maps-and-sets.md) | Hash Maps And Sets | hash map/set, frequency, complement |
| [03](chapters/coding-patterns/03-linked-lists.md) | Linked Lists | pointer manipulation, dummy node, reversal |
| [04](chapters/coding-patterns/04-fast-and-slow-pointers.md) | Fast And Slow Pointers | Floyd's cycle detection, midpoint |
| [05](chapters/coding-patterns/05-sliding-windows.md) | Sliding Windows | fixed window, dynamic window |
| [06](chapters/coding-patterns/06-binary-search.md) | Binary Search | lower/upper bound, monotonic predicate |
| [07](chapters/coding-patterns/07-stacks.md) | Stacks | LIFO, monotonic stack, deque |
| [08](chapters/coding-patterns/08-heaps.md) | Heaps | min/max-heap, top-k, k-way merge |
| [09](chapters/coding-patterns/09-intervals.md) | Intervals | sort by start, overlap, sweep line |
| [10](chapters/coding-patterns/10-prefix-sums.md) | Prefix Sums | running sum, range query, complement |
| [11](chapters/coding-patterns/11-trees.md) | Trees | tree traversal, BFS/DFS, BST |
| [12](chapters/coding-patterns/12-tries.md) | Tries | prefix search, wildcard matching |
| [13](chapters/coding-patterns/13-graphs.md) | Graphs | DFS/BFS, Dijkstra, Union-Find, topological sort |
| [14](chapters/coding-patterns/14-backtracking.md) | Backtracking | state space tree, undo/redo, pruning |
| [15](chapters/coding-patterns/15-dynamic-programming.md) | Dynamic Programming | memoization, tabulation, recurrence |
| [16](chapters/coding-patterns/16-greedy.md) | Greedy | greedy choice property, two-pass |
| [17](chapters/coding-patterns/17-sort-and-search.md) | Sort And Search | quicksort, quickselect, merge sort |
| [18](chapters/coding-patterns/18-bit-manipulation.md) | Bit Manipulation | XOR, masks, bit counting |
| [19](chapters/coding-patterns/19-math-and-geometry.md) | Math And Geometry | GCD, modular arithmetic, slope |

### Machine Learning System Design Interview

| # | Title | Key Frameworks |
|---|-------|----------------|
| [00](chapters/ml/00-introduction-and-overview.md) | Introduction and Overview | 7-step framework, ML objective, metrics |
| [01](chapters/ml/01-visual-search-system.md) | Visual Search System | representation learning, ANN |
| [02](chapters/ml/02-google-street-view-blurring-system.md) | Google Street View Blurring System | object detection, NMS, mAP |
| [03](chapters/ml/03-youtube-video-search.md) | YouTube Video Search | two-tower model, inverted index |
| [04](chapters/ml/04-harmful-content-detection.md) | Harmful Content Detection | multi-task learning, ROC/PR-AUC |
| [05](chapters/ml/05-video-recommendation-system.md) | Video Recommendation System | candidate gen, scoring, re-ranking |
| [06](chapters/ml/06-event-recommendation-system.md) | Event Recommendation System | pointwise LTR, GBDT vs NN |
| [07](chapters/ml/07-ad-click-prediction-on-social-platforms.md) | Ad Click Prediction on Social Platforms | FM/DeepFM/DCN, feature crossing |
| [08](chapters/ml/08-similar-listings-on-vacation-rental-platforms.md) | Similar Listings on Vacation Rental Platforms | session-based rec, negative sampling |
| [09](chapters/ml/09-personalized-news-feed.md) | Personalized News Feed | pointwise LTR, multi-task DNN |
| [10](chapters/ml/10-people-you-may-know.md) | People You May Know | edge prediction, GNN |

### Generative AI System Design Interview

| # | Title | Key Frameworks |
|---|-------|----------------|
| [00](chapters/genai/00-introduction-and-overview.md) | Introduction and Overview | discriminative vs generative, scaling laws |
| [01](chapters/genai/01-gmail-smart-compose.md) | Gmail Smart Compose | decoder-only Transformer, beam search |
| [02](chapters/genai/02-google-translate.md) | Google Translate | encoder-decoder, BPE, MLM |
| [03](chapters/genai/03-chatgpt-personal-assistant-chatbot.md) | ChatGPT: Personal Assistant Chatbot | RoPE, SFT, RLHF |
| [04](chapters/genai/04-image-captioning.md) | Image Captioning | ViT encoder-decoder, CIDEr |
| [05](chapters/genai/05-retrieval-augmented-generation.md) | Retrieval-Augmented Generation | RAG, embeddings, vector DB |
| [06](chapters/genai/06-realistic-face-generation.md) | Realistic Face Generation | GAN, adversarial training |
| [07](chapters/genai/07-high-resolution-image-synthesis.md) | High-Resolution Image Synthesis | VQ-VAE, autoregressive Transformer |
| [08](chapters/genai/08-text-to-image-generation.md) | Text-to-Image Generation | diffusion model, U-Net, DiT, CFG |
| [09](chapters/genai/09-personalized-headshot-generation.md) | Personalized Headshot Generation | DreamBooth, LoRA, textual inversion |
| [10](chapters/genai/10-text-to-video-generation.md) | Text-to-Video Generation | latent diffusion, temporal layers |

### Mobile System Design Interview

| # | Title | Key Frameworks |
|---|-------|----------------|
| [00](chapters/mobile/00-introduction.md) | Introduction | MSD interview, rubric leveling |
| [01](chapters/mobile/01-a-framework-for-mobile-sd-interviews.md) | A framework for Mobile SD interviews | 5-step framework, API design |
| [02](chapters/mobile/02-news-feed-app.md) | News feed app | offline-first, cursor pagination, SSOT |
| [03](chapters/mobile/03-chat-app.md) | Chat app | WebSockets, message ordering, idempotency |
| [04](chapters/mobile/04-stock-trading-app.md) | Stock trading app | buffered UI, WebView charts |
| [05](chapters/mobile/05-pagination-library.md) | Pagination library | generics, caching, priority scheduling |
| [06](chapters/mobile/06-hotel-reservation-app.md) | Hotel reservation app | reservation holds, FTS, payments |
| [07](chapters/mobile/07-google-drive-app.md) | Google Drive app | resumable uploads, block-level sync |
| [08](chapters/mobile/08-youtube-app.md) | YouTube app | adaptive streaming, prefetching |
| [09](chapters/mobile/09-mobile-system-design-building-blocks.md) | Mobile System Design Building Blocks | architecture, storage, networking |
| [10](chapters/mobile/10-quick-reference-cheat-sheet-for-msd-interview.md) | Quick Reference Cheat Sheet | checklist, network, performance |

### Object-Oriented Design Interview

| # | Title | Key Frameworks |
|---|-------|----------------|
| [00](chapters/ood/00-what-is-an-object-oriented-design-interview.md) | What is an Object-Oriented Design Interview | product sense, systems thinking |
| [01](chapters/ood/01-a-framework-for-the-ood-interview.md) | A Framework for the OOD Interview | requirements, class design, UML |
| [02](chapters/ood/02-oop-fundamentals.md) | OOP Fundamentals | encapsulation, SOLID |
| [03](chapters/ood/03-design-a-parking-lot.md) | Design a Parking Lot | Strategy, Facade |
| [04](chapters/ood/04-design-a-movie-ticket-booking-system.md) | Design a Movie Ticket Booking System | Strategy, concurrency, locking |
| [05](chapters/ood/05-design-a-unix-file-search-system.md) | Design a Unix File Search System | Composite, generics |
| [06](chapters/ood/06-design-a-vending-machine.md) | Design a Vending Machine | Facade, State, Composite |
| [07](chapters/ood/07-design-an-elevator-system.md) | Design an Elevator System | Strategy, Observer |
| [08](chapters/ood/08-design-a-grocery-store-system.md) | Design a Grocery Store System | Strategy, Composite, Decorator |
| [09](chapters/ood/09-design-a-tic-tac-toe-game.md) | Design a Tic Tac Toe Game | SRP, Memento, state machine |
| [10](chapters/ood/10-design-a-blackjack-game.md) | Design a Blackjack Game | immutability, enums, Strategy |

### How to Write a Good Resume

| # | Title | Key Frameworks |
|---|-------|----------------|
| [01](chapters/resume/01-introduction.md) | Introduction | resume goal, audience |
| [03](chapters/resume/03-chapter-1-why-resumes-and-cvs-are-important.md) | Why Resumes and CVs are Important | yes/maybe/no, good vs great |
| [04](chapters/resume/04-chapter-2-the-hiring-pipeline.md) | The Hiring Pipeline | hiring pipeline, referrals, ATS myths |
| [06](chapters/resume/06-chapter-3-tech-resume-basics.md) | Tech Resume Basics | first-glance facts, ground rules |
| [07](chapters/resume/07-chapter-4-resume-structure.md) | Resume Structure | sections, telling a story |
| [08](chapters/resume/08-chapter-5-standing-out.md) | Standing Out | results/impact/contribution, tailoring |
| [09](chapters/resume/09-chapter-6-common-mistakes.md) | Common Mistakes | formatting, audience, details |
| [10](chapters/resume/10-chapter-7-different-experience-levels-different-career-paths.md) | Different Experience Levels, Different Career Paths | levels, career changers, managers |
| [11](chapters/resume/11-chapter-8-exercises-to-polish-your-resume.md) | Exercises to Polish Your Resume | impact numbers, feedback |
| [12](chapters/resume/12-chapter-9-beyond-the-resume.md) | Beyond the Resume | LinkedIn, GitHub, cover letters |
| [14](chapters/resume/14-chapter-10-good-resume-template-principles.md) | Good Resume Template Principles | top-down layout, scan |
| [15](chapters/resume/15-chapter-11-resume-templates.md) | Resume Templates | template reviews, skill ratings |
| [16](chapters/resume/16-chapter-12-resume-improvement-examples.md) | Resume Improvement Examples | before/after, checklist |
| [17](chapters/resume/17-chapter-13-advice-for-hiring-managers-on-running-a-good-screening-process.md) | Advice for Hiring Managers | fair screening, feedback loops |
| [18](chapters/resume/18-conclusion.md) | Conclusion | summary |

## Topic Index

**System design**: CAP theorem → system-design/07 · consistent hashing → system-design/06 · quorum/vector clocks → system-design/07 · token bucket → system-design/05 · snowflake ID → system-design/08 · base 62 → system-design/09 · fanout on write/read → system-design/12 · WebSocket → system-design/13, mobile/03 · trie + top-k → system-design/14 · URL frontier → system-design/10 · DAG transcoding → system-design/15 · geohash/quadtree/S2 → system-design/17 · delta sync → system-design/16 · Redis pub/sub → system-design/18 · WAL → system-design/20 · consumer group/ISR → system-design/20 · pull vs push → system-design/21 · watermark → system-design/22 · locking (optimistic/pessimistic) → system-design/23, ood/04 · inverted index → system-design/24 · erasure coding → system-design/25 · sorted set/skip list → system-design/26 · double-entry ledger → system-design/27 · event sourcing/CQRS → system-design/28 · matching engine/sequencer → system-design/29

**Coding patterns**: two pointers → coding-patterns/01 · hash map/set → coding-patterns/02 · linked lists → coding-patterns/03 · fast & slow pointers → coding-patterns/04 · sliding window → coding-patterns/05 · binary search → coding-patterns/06 · stacks/monotonic stack → coding-patterns/07 · heaps → coding-patterns/08 · intervals → coding-patterns/09 · prefix sums → coding-patterns/10 · trees → coding-patterns/11 · tries → coding-patterns/12 · graphs/BFS/Dijkstra/Union-Find → coding-patterns/13 · backtracking → coding-patterns/14 · dynamic programming → coding-patterns/15 · greedy → coding-patterns/16 · sort & search → coding-patterns/17 · bit manipulation → coding-patterns/18 · math & geometry → coding-patterns/19

**ML**: 7-step framework → ml/00 · representation learning/contrastive → ml/01 · ANN → ml/01, genai/05 · object detection/NMS/mAP → ml/02 · two-tower → ml/03, ml/05 · multi-task learning → ml/04, ml/09 · candidate gen/scoring/re-ranking → ml/05 · LTR (pointwise) → ml/06, ml/09 · FM/DeepFM/DCN → ml/07 · NCE → ml/07 · negative sampling → ml/08 · GNN/edge prediction → ml/10

**GenAI**: transformer variants → genai/01 · BPE/MLM → genai/01, genai/02 · RoPE/SFT/RLHF → genai/03 · beam search → genai/01, genai/02, genai/04 · CIDEr → genai/04 · RAG → genai/05 · GAN/mode collapse/FID → genai/06 · VQ-VAE → genai/07 · diffusion/CFG/DDIM → genai/08 · DreamBooth/LoRA → genai/09 · latent diffusion → genai/10

**Mobile**: SSOT/offline-first → mobile/02 · optimistic writes → mobile/02 · cursor pagination → mobile/02, mobile/05 · buffered UI → mobile/04 · resumable uploads → mobile/07 · adaptive streaming → mobile/08 · UDF → mobile/09

**OOD**: SOLID → ood/02 · Strategy → ood/03 · Facade → ood/03 · Composite → ood/05 · State → ood/06 · Observer → ood/07 · Decorator → ood/08 · Memento → ood/09

**Resume**: yes/maybe/no → resume/03 · hiring pipeline/ATS → resume/04 · resume structure → resume/07 · results/impact/contribution → resume/08 · common mistakes → resume/09 · template principles → resume/14

## Supporting Files

- [glossary.md](glossary.md) — all key terms with definitions
- [patterns.md](patterns.md) — all techniques and design patterns
- [cheatsheet.md](cheatsheet.md) — quick reference decision rules and tables

---

## Scope & Limits

This skill synthesizes ByteByteGo's commercial interview-prep content into summaries — it is not the original text and must remain private (do not publish or redistribute). For hands-on implementation in your codebase, combine with project-specific tools. For topics beyond this material, check related skills or ask the agent directly.
