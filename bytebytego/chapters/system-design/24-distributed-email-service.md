# 24: Distributed Email Service

## Core Idea
A storage-heavy system (~2 PB/year) where the design pivots on a custom NoSQL metadata store denormalized per user, a separate S3 attachment store, and treating **deliverability** and **search** as first-class hard problems.

## Design Framework / Approach
Move from traditional SMTP/POP/IMAP single-server Maildir to a distributed architecture: web servers + real-time (WebSocket/long-polling) servers + metadata DB + S3 attachment store + Redis cache + search store. Two flows — sending (outgoing queue → SMTP workers) and receiving (incoming queue → mail processors → storage + real-time push).

## Key Concepts & Components
- **Sending flow**: validate → outgoing queue → SMTP workers; queue decouples workers and enables exponential-backoff retries.
- **Receiving flow**: SMTP LB → incoming queue → mail processing (spam/virus) → storage/cache/object store → real-time push.
- **Metadata DB**: per-user partition key `user_id`, clustering by TIMEUUID `email_id`; denormalize `read_emails`/`unread_emails` tables since NoSQL can't filter on non-key columns.
- **Attachment store**: S3 (Cassandra blob limit <1MB; row cache too small).
- **Search**: inverted index via Elasticsearch (user_id partition), or custom LSM-tree engine; email search is write-heavy (reindex on send/receive) unlike web search.
- **Deliverability**: dedicated IPs + warm-up (2-6 weeks), classify email per IP, SPF/DKIM/DMARC, feedback loops (hard/soft bounce, complaint).
- **Consistency**: single primary per mailbox; trade availability for consistency during failover.

## Trade-offs & Anti-patterns
- **Relational DB for email**: BLOB search is inefficient and small-chunk-optimized — custom NoSQL wins.
- **Cassandra for attachments**: blob limit + row cache memory blow up — use S3.
- **Elasticsearch vs custom search**: Elasticsearch is fine at smaller scale; Gmail/Outlook scale needs native embedded search.
- **POP (download-and-delete)**: single-device only; IMAP/HTTP keep mail server-side for multi-device.

## Key Takeaways
1. Denormalize per read/unread status in NoSQL rather than filtering in the application at scale.
2. Attachments and metadata belong in different stores (S3 vs NoSQL) because their sizes and access differ.
3. Getting mail delivered (reputation, warm-up, auth) is harder than sending it.

## Connects To
- **S3-like Object Storage**: attachment store.
- **Distributed Message Queue**: incoming/outgoing queues.
- **Design a Chat System**: real-time push via WebSocket/long-polling parallels.
