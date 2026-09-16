# 17: Proximity Service

## Core Idea
Discover nearby businesses by dividing the map into spatial grids, indexing them, and answering "what's within a radius" with a read-heavy, stateless location-based service backed by caches — the heart of which is a geospatial index.

## Design Framework / Approach
Split the system into a read-heavy **location-based service (LBS)** and a **business service** (CRUD). Walk through five indexing options (2D search → even grid → geohash → quadtree → Google S2), pick geohash as the simplest, then scale via read replicas, Redis caching keyed by geohash, and multi-region/availability-zone deployment.

## Key Concepts & Components
- **Geohash**: recursively halves lat/long into a 1D base32 string; shared prefix ⇒ closer. Radius→length mapping (0.5km→6, 5km→4).
- **Quadtree**: in-memory tree, recursively subdivides until a grid has ≤ N businesses; fits in ~1.7GB and supports k-nearest queries.
- **Google S2**: Hilbert-curve-based sphere index; great for geofencing and flexible cell sizes.
- **Boundary issues**: nearby points across equator/meridian share no prefix; fix by also querying the 8 neighbor grids.
- **Geo index table**: compound key `(geohash, business_id)` (one row per business) so add/remove needs no locking.
- **Cache**: key by geohash (not raw lat/lng — GPS jitters), value = business ID list; also cache hydrated business objects.

## Trade-offs & Anti-patterns
- **Sharding the geo index**: unnecessary when the full index fits in one server's working set; prefer read replicas over sharding.
- **Raw lat/lng as cache key**: breaks the cache (tiny movements produce different keys); geohash grids absorb the jitter.
- **Quadtree in-memory build**: takes minutes and blocks traffic — roll out incrementally or use blue/green; update via nightly job, not live locking.
- **Dynamic tile generation (Google Maps ch.19) vs. cached grids here**: always precompute and cache.

## Key Takeaways
1. A geospatial index is the core of any location search — geohash for simplicity, quadtree for k-nearest, S2 for geofencing.
2. Keep the geo index on one machine (replicate for reads) rather than prematurely sharding.
3. Cache by geohash and by business_id, not by coordinates.

## Connects To
- **Nearby Friends**: same geohash concept but for *moving* user locations (dynamic vs. static).
- **Google Maps**: reuses geohash for map tiles and routing tiles.
- **Real-time Gaming Leaderboard**: both use sorted/ranked in-memory structures.
