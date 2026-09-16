# 09: Design A URL Shortener

## Core Idea
Map long URLs to 7-character short codes using base-62 conversion of a unique ID, store `<shortURL, longURL>` in a DB behind a cache, and redirect reads via 301/302.

## Design Framework / Approach
1. Clarify scope: traffic (100M URLs/day), shortest possible URL, character set `[0-9a-zA-Z]`, no delete/update.
2. Back-of-envelope: ~1160 writes/s, ~11.6k reads/s (10:1), 365B records over 10 years ≈ 36.5 TB.
3. Define two REST APIs: `POST api/v1/data/shorten` and `GET api/v1/shortUrl`.
4. Choose redirect: 301 (permanent, cached, less server load) vs 302 (temporary, enables analytics).
5. Compute hash length: smallest n with `62^n ≥ 365B` → **n = 7**.
6. Pick hash function: **hash + collision resolution** vs **base 62 conversion**.
7. Store mapping in a relational DB; cache reads (reads >> writes).

## Key Concepts & Components
- **301 vs 302 redirect**: 301 lets browsers cache the redirect (fewer hits to the shortener); 302 sends every request through (better click tracking).
- **Base 62 conversion**: encode the unique ID into `[0-9a-zA-Z]`; no collisions, but URL length grows with ID.
- **Hash + collision resolution**: CRC32/MD5/SHA-1 then take first 7 chars; short and fixed length but needs collision handling (append predefined string; bloom filter to speed lookups).
- **Unique ID generator**: supplies the primary key converted to the short code.
- **Bloom filter**: space-efficient probabilistic membership test for shortURL existence.

## Trade-offs & Anti-patterns
- **Hash + collision resolution vs base 62**: fixed length and no ID dependency, but collisions possible and next-ID is unpredictable (vs. base 62 which leaks sequence and depends on an ID generator).
- **301 vs 302**: 301 saves server load; 302 preserves analytics — pick per priority.
- **Hash table in memory for all mappings**: not feasible at scale; use a DB.

## Key Takeaways
1. Use base 62 conversion + a distributed unique ID generator for a clean, collision-free design.
2. Store mappings in a relational DB, cache the hot read path, and enforce a rate limiter to stop abuse.
3. Keep the web tier stateless so it scales horizontally.

## Connects To
- **08-design-a-unique-id-generator-in-distributed-systems**: source of the IDs to encode.
- **05-design-a-rate-limiter**: guards against malicious shortening floods.
- **07-design-a-key-value-store**: bloom filter + KV reuse.
- **02-scale-from-zero-to-millions-of-users**: stateless tier, DB replication/sharding.
