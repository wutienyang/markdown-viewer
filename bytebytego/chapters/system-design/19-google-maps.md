# 19: Google Maps

## Core Idea
Three features — location updates, navigation/ETA, and map rendering — each with a distinct data strategy: a write-heavy Cassandra location store, hierarchical routing tiles for A* pathfinding, and precomputed CDN-served map tiles.

## Design Framework / Approach
Introduce "Map 101" (projection, geocoding, geohash, tiling, routing tiles), estimate storage (~100 PB of tiles), then design three services: Location (batch GPS → Cassandra + Kafka), Navigation (geocode → shortest-path on routing tiles → ETA → ranker), and Map Rendering (precomputed tiles via CDN).

## Key Concepts & Components
- **Web Mercator**: Google's projection; **geocoding** (address↔lat/lng) and reverse geocoding.
- **Map tiling**: world split into 256×256 PNG tiles at 21 zoom levels; fetch only viewport tiles.
- **Routing tiles**: roads as graph (intersections=nodes, roads=edges) split into geohash-keyed tiles, three detail levels (local/arterial/highway), loaded on demand by A*.
- **Shortest-path service**: A* over routing tiles in S3, geohash to locate start/end tiles.
- **ETA service**: ML prediction from live + historical traffic; **Ranker** applies user filters (no tolls, etc).
- **Adaptive ETA/reroute**: track active users by route tiles; use `r → super(r)` hierarchy to filter affected users fast.
- **Vector tiles**: send paths/polygons instead of raster images — better compression and smoother zoom.
- **Delivery**: WebSocket over long polling/SSE/push for reroute notifications.

## Trade-offs & Anti-patterns
- **Dynamic tile generation**: infinite location×zoom combos, huge server load, no caching — precompute static tiles and serve via CDN.
- **Client-hardcoded geohash→URL**: risky to change later; an intermediary map tile service adds flexibility.
- **One giant world graph**: too much memory; tile the graph so algorithms hydrate neighbors lazily.
- **Storage math**: 4.4T tiles at zoom 21 ≈ 440 PB, but 90% uninhabited ⇒ compress to ~50-100 PB.

## Key Takeaways
1. Separate location (write-heavy NoSQL), routing (tiled graph + A*), and rendering (static CDN tiles) — each has a different scaling shape.
2. Tile both images and the road graph; hierarchical tiles keep long-range routing fast.
3. Batch client GPS updates (~15s) to cut write QPS by an order of magnitude.

## Connects To
- **Proximity Service**: geohash encoding for tiles.
- **S3-like Object Storage**: routing tiles live in object storage.
- **Distributed Message Queue**: Kafka streams location data to downstream consumers.
