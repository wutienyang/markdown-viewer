# 12: Design A News Feed System

## Core Idea
A news feed splits into two flows — feed publishing (write post → fanout) and news feed building (read aggregated posts) — and uses a hybrid push/pull fanout strategy to balance latency against celebrity/hotkey load.

## Design Framework / Approach
1. Clarify: mobile + web, post + view friends' feed, reverse-chronological order, 5000 friends, 10M DAU, media supported.
2. Define APIs: `POST /v1/me/feed` (content, auth_token) and `GET /v1/me/feed` (auth_token).
3. **Feed publishing**: web servers (auth + rate limit) → post service (persist) → fanout service (deliver to friends) → notification service.
4. **News feed building**: newsfeed service fetches feed IDs from cache and hydrates full objects.
5. Choose fanout model, then deep dive fanout + retrieval + cache layering.

## Key Concepts & Components
- **Fanout on write (push model)**: precompute and push new posts to friends' caches at write time — fast reads, but hotkey problem for celebrities and wasted work for inactive users.
- **Fanout on read (pull model)**: build feed on-demand at read time — no hotkey, efficient for inactive users, but slower reads.
- **Hybrid approach**: push for most users, pull for celebrities/heavy-followed users; consistent hashing to spread hot keys.
- **Fanout service steps**: fetch friend IDs from graph DB → filter by user settings from user cache → enqueue `<post_id, user_id>` via message queue → fanout workers write to news feed cache.
- **News feed cache**: stores only `<post_id, user_id>` pairs (not full objects) with a configurable size cap.
- **CDN**: stores media content (images/videos) for fast retrieval.
- **Cache layers**: News Feed, Content (hot cache), Social Graph, Action, Counters.

## Trade-offs & Anti-patterns
- **Pure push**: slow for users with many friends and wasteful for inactive users.
- **Pure pull**: slow reads since nothing is precomputed.
- **Storing full objects in feed cache**: explodes memory; store IDs only and hydrate on read.

## Key Takeaways
1. Use a hybrid fanout — push for normal users, pull for celebrities — to keep reads fast without overloading hot shards.
2. Store only IDs in the news feed cache, then hydrate full post/user objects on retrieval.
3. Split the cache into specialized layers (feed, content, graph, action, counters) for independent scaling.

## Connects To
- **06-design-consistent-hashing**: mitigates the hotkey problem.
- **02-scale-from-zero-to-millions-of-users**: stateless tier, message queues, caching.
- **11-design-a-notification-system**: notifies friends of new posts.
- **04-a-framework-for-system-design-interviews**: the running example.
