# 16: Design Google Drive

## Core Idea
A file storage + sync service where a file is split into blocks, deduplicated, compressed, and encrypted before upload, and only modified blocks are synced — trading clever block-level sync and strong metadata consistency for low bandwidth and fast sync.

## Design Framework / Approach
Scale up from a single server (web server + MySQL + a `drive/` namespace directory), then decouple into independent layers: load balancer, stateless API servers, metadata DB, and S3-backed block storage. Split upload into two parallel flows — "add file metadata" and "upload file content" — coordinated through a notification service. Files are chunked into ~4MB blocks; each block gets a unique hash and is stored independently.

## Key Concepts & Components
- **Block server**: splits files into blocks, compresses each (gzip/bzip2 for text), encrypts, and uploads only changed blocks.
- **Delta sync**: on edit, only modified blocks transfer instead of the whole file (rsync-style algorithm).
- **Metadata database**: stores users, devices, namespaces, files, file versions, and block mappings; relational DB chosen for native ACID.
- **Metadata cache**: caches metadata; must be invalidated on write to preserve strong consistency.
- **Notification service**: pub/sub over **long polling** (preferred over WebSocket — updates are infrequent and one-directional).
- **Offline backup queue**: buffers changes for offline clients to sync on reconnect.
- **Sync conflict**: "first version processed wins"; the later writer is offered both copies to merge or override.
- **Storage savings**: block dedup (same hash = same block), version limits, and cold storage (S3 Glacier).

## Trade-offs & Anti-patterns
- **Uploading straight from client to S3**: faster (one hop) but duplicates chunk/compress/encrypt logic on every platform and puts encryption on hackable clients — prefer centralized block servers.
- **Eventual-consistency caches**: unacceptable for metadata; invalidate cache on DB write to keep replicas consistent.
- **WebSocket for notifications**: overkill for infrequent, non-bi-directional updates; long polling is simpler and scales to ~1M connections per machine.

## Key Takeaways
1. Decouple file content (object store) from file metadata (ACID relational DB) — they scale and fail independently.
2. Use delta sync + block compression to cut bandwidth; use block dedup and version limits to cut storage cost.
3. Long polling, not WebSocket, is the right notification transport for file-change events.

## Connects To
- **S3-like Object Storage**: Google Drive's block storage layer is the S3 design covered there.
- **Distributed Message Queue**: the notification/offline queue relies on message-queue decoupling.
- **Key-value Store**: block-level dedup and cache invalidation mirror KV consistency techniques.
