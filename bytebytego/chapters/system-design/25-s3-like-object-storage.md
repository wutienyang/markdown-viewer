# 25: S3-like Object Storage

## Core Idea
Immutable object storage split into a **data store** (immutable bytes, WAL-style grouped files) and a **metadata store** (mutable, sharded by bucket+object name), made durable via **replication or erasure coding**.

## Design Framework / Approach
Mirror the UNIX inode design: metadata (like inodes) stores object_id→data-location; data store holds raw bytes by UUID. Data store = routing service + placement service (virtual cluster map, Paxos/Raft) + data nodes. Small objects are appended to a read-write file (like a WAL) until it fills, then marked read-only; an `object_mapping` table (SQLite per node) maps UUID→(file, offset, size).

## Key Concepts & Components
- **Block vs file vs object storage**: object = immutable, flat, RESTful, cold/archival, low cost.
- **Data node / replication group**: primary + 2 secondaries; strongly consistent if primary waits for all replicas.
- **Placement service + virtual cluster map**: heartbeat-monitored; keeps replicas in separate failure domains (racks/AZs).
- **Replication vs erasure coding**: 3-copy = 6 nines, 200% overhead, fast reads; (8+4) erasure coding = 11 nines, 50% overhead, slower reads.
- **Checksum (MD5)**: appended to each object to detect corruption across process boundaries.
- **Multipart upload**: split large objects into parts with ETags; reassemble on complete; GC reclaims abandoned parts.
- **Versioning**: insert new row with TIMEUUID version + object_id; delete = insert a delete marker.
- **Listing**: denormalize a listing table sharded by bucket_id to avoid cross-shard pagination.

## Trade-offs & Anti-patterns
- **One file per small object**: wastes disk blocks + exhausts inodes — merge into WAL-style large files.
- **Erasure coding everywhere**: higher durability/lower cost but slower reads and complex rebuild — reserve for cold data.
- **Sharding metadata by bucket_id**: hot buckets with billions of objects create hotspots — shard by hash(bucket_name, object_name).
- **Serialized read-write file**: one writer kills multi-core throughput; give each core a dedicated file.

## Key Takeaways
1. Separate immutable data from mutable metadata; optimize each independently.
2. Durability = failure-domain separation + replication (or erasure coding for cost).
3. Group small objects into large WAL files and keep a per-node SQLite mapping for fast lookup.

## Connects To
- **Design Google Drive**: block storage layer is object storage.
- **Distributed Message Queue**: same WAL/segment append pattern.
- **Design a Key-value Store**: checksum + compaction mirror LSM/storage-engine concerns.
