# 02: News feed app

## Core Idea
Design an infinite-scrolling feed at 500M MAU that works offline. The key decisions: REST+JSON with cursor pagination, a local relational DB as the Single Source of Truth (SSOT), and optimistic writes to keep interactions instant.

## Design Framework / Approach
- **Protocol/format**: HTTP with REST APIs + JSON (skip GraphQL/Protobuf unless performance-critical).
- **Pagination**: use cursor-based over offset — offset degrades on frequently-updated feeds and produces inaccurate windows.
- **Data models**: two-tier list/detail models — a lightweight `PostPreview` (summary + one thumbnail) for the feed and a full `PostDetail` loaded only on tap.
- **ID/timestamp generation**: centralize on the backend (consistency, reliability, uniqueness, DB integration).
- **Architecture**: layered UI + data with Unidirectional Data Flow (UDF) and reactive programming; repository + remote/local data sources; dependency injection.
- **Local storage**: relational DB (SQLite/Room/Core Data) with a hybrid eviction policy (LRU + TTL + minimum threshold); default ~100-200MB cache, 15-day TTL, keep ~50 posts.
- **Rich content**: encode as HTML, but render by parsing into native UI components (not WebView) for scroll performance; sanitize against XSS.

## Key Concepts & Components
- **Single Source of Truth (SSOT)**: local DB is the only data source for UI; flow is Backend → Local Storage → UI.
- **Optimistic writes**: update UI immediately, persist locally, sync in background.
- **UserInteraction queue**: a table tracking pending interactions (status PENDING/FAILED/CANCELED, failureCount) flushed on reconnect with exponential backoff.
- **Media Loader / Post Content Renderer / HTML Parser**: central components for media and rich text.
- **View recycling**: reuse views (RecyclerView/LazyColumn, UITableView/UICollectionView) to avoid jank.

## Trade-offs & Anti-patterns
- **Offset pagination on live feeds**: causes duplicates/skips as content shifts — prefer cursors.
- **WebView for feed posts**: higher memory and janky scroll — parse to native components.
- **Client-generated IDs/timestamps**: clock drift and manipulation risk — keep backend authoritative.
- **Unbounded local cache**: implement eviction or storage grows unbounded.
- **Rolling back optimistic writes silently**: notify users on critical failures to avoid confusing UI states.

## Key Takeaways
1. Make the local database the SSOT to get offline-first behavior almost for free.
2. Queue interactions locally and retry with exponential backoff rather than dropping them offline.
3. Split list vs detail models to save bandwidth and memory on low-end devices.

## Connects To
- **03-chat-app**: same layered/UDF skeleton; message ordering builds on optimistic writes.
- **05-pagination-library**: how to extract cursor/offset pagination into a reusable, generic component.
- **09-mobile-system-design-building-blocks**: SSOT, UDF, eviction policies, and pagination deep dives.
