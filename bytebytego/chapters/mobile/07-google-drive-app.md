# 07: Google Drive app

## Core Idea
Design a cloud-storage mobile client (10M DAU, 10GB files) with resumable uploads, version history, cross-device sync, and optional enterprise encryption. Key decisions: REST (+ SSE/WebSocket for change notifications), chunked resumable uploads, optimistic concurrency for conflicts, and AES-256 at rest.

## Design Framework / Approach
- **Protocol**: HTTP + REST for file/folder operations; SSE or WebSocket for lightweight change notifications (not file content); gRPC/Protobuf is a strong alternative at scale.
- **Unified endpoints**: folders treated as files with a special type; list/get/download/create/delete/patch under `/v1/files`.
- **Resumable uploads**: initiate session (`POST /v1/upload?uploadType=resumable`) → PUT chunks with `Content-Range` (201 final / 308 Resume Incomplete) → resume via `GET /v1/upload/{uploadId}` → `DELETE` to cancel. Simple (≤5MB media) vs multipart (≤5MB + metadata) vs resumable (>5MB).
- **Storage**: relational DB for metadata (File/FileRevision) with LRU ~200MB cap; downloaded files in private sandbox internal storage keyed by fileId.
- **Versioning**: full copy upload (simple/reliable) vs block-level sync (efficient, complex — Dropbox's Broccoli). Detect conflicts with optimistic concurrency control (`If-Match` / version header → 409), resolve via Last-Write-Wins or version forking.
- **Encryption**: AES-256 for metadata + files; keys in Android Keystore / iOS Keychain (Secure Enclave); derive via PBKDF2 for offline access.

## Key Concepts & Components
- **UploadResponse**: uploadId, totalChunks, chunksProcessed, chunkSize, uploadUrl, expiresAt — tracks progress and resume points.
- **File Splitter / File Uploader Repository / File Uploader Service**: background upload pipeline components.
- **Optimistic concurrency control**: compare client version against server's before commit; reject with 409 on mismatch.
- **Background task persistence**: save pending UploadResponse to disk; resume on app launch, monitoring battery/network.
- **Key management**: hardware-backed storage; exclude encrypted files from system backups.

## Trade-offs & Anti-patterns
- **Full copy vs block-level sync**: full copy is simpler and reliable but bandwidth/storage heavy; block-level saves bytes but adds complexity.
- **Storing multiple DB files across FK boundaries**: keep metadata tables together; enforce referential integrity.
- **Restarting uploads from zero**: persist upload sessions to survive OS background-task termination.
- **Blocking UI with encryption**: run AES on background threads; encrypt/decrypt large files off the main thread.

## Key Takeaways
1. Design resumable uploads around a persisted upload session with chunk offset tracking.
2. Use optimistic concurrency control (version check → 409) to prevent lost updates across devices.
3. Encrypt at rest with platform keystore-backed keys, deriving offline keys from user credentials.

## Connects To
- **06-hotel-reservation-app**: tokenization, API Gateway, and server-authoritative state.
- **02-news-feed-app**: SSOT and local relational storage patterns.
- **09-mobile-system-design-building-blocks**: secure storage, AES, and device-fragmentation concerns.
