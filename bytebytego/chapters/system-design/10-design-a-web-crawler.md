# 10: Design A Web Crawler

## Core Idea
A crawler downloads pages by iterating download → parse → extract links → enqueue, but scale demands a politeness- and priority-aware URL frontier plus deduplication via "URL Seen?" and "Content Seen?" checks.

## Design Framework / Approach
1. Clarify: purpose (search indexing), scale (1B pages/month), HTML only, handle new/edited pages, store 5 years, ignore duplicates.
2. Back-of-envelope: ~400 pages/s (800 peak), 500 TB/month, 30 PB over 5 years.
3. Sketch the pipeline: **Seed URLs → URL Frontier → HTML Downloader → (DNS) → Content Parser → Content Seen? → URL Extractor → URL Filter → URL Seen? → URL Frontier**.
4. Deep dive: BFS vs DFS, URL frontier (politeness, priority, freshness), HTML downloader (robots.txt, performance), robustness, extensibility, and avoiding problematic content.

## Key Concepts & Components
- **Seed URLs**: starting points; choose by locality/topic to traverse broadly.
- **URL Frontier**: FIFO queue of URLs to download; split into **front queues** (prioritization) and **back queues** (politeness).
- **Politeness**: one page at a time per host with delays; map host→queue so each worker thread stays on one host.
- **Priority**: rank URLs by PageRank/traffic/update frequency; bias queue selection toward higher priority.
- **Freshness**: recrawl based on update history; prioritize important pages.
- **robots.txt (Robots Exclusion Protocol)**: pages a site allows crawlers to fetch; cache the file.
- **Content Seen? / URL Seen?**: hash/checksum and bloom-filter deduplication of content and URLs.
- **Spider trap**: infinite link structures; mitigate via URL length caps and manual blacklisting.

## Trade-offs & Anti-patterns
- **DFS**: depth can be unbounded; prefer BFS (FIFO) for crawlers.
- **Plain BFS**: floods a single host (impolite) and ignores URL priority — fix with the URL frontier.
- **Synchronous DNS**: blocks threads (10–200 ms); cache DNS resolution.
- **All URLs in memory or all on disk**: use a hybrid — disk for bulk, in-memory buffers for enqueue/dequeue.

## Key Takeaways
1. Enforce politeness and priority with a two-module URL frontier; don't dump everything into one naive FIFO.
2. Deduplicate with hashes/bloom filters for both URLs and content (~30% of the web is duplicated).
3. Keep downloaders stateless and distribute with consistent hashing; handle bad HTML, traps, and noise gracefully.

## Connects To
- **06-design-consistent-hashing**: distributes load across downloader servers.
- **02-scale-from-zero-to-millions-of-users**: message queues, replication, sharding, stateless tiers.
- **07-design-a-key-value-store**: bloom filter reuse.
- **14-design-a-search-autocomplete-system**: crawler/index feeds search products.
