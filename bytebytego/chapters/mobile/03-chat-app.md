# 03: Chat app

## Core Idea
Design a 1:1 real-time chat app (30M DAU) where the backend acts as a temporary relay, not permanent storage. The key decisions: hybrid HTTP + WebSocket protocol, server-generated message IDs for ordering, and a local relational DB for durable history.

## Design Framework / Approach
- **Protocols**: HTTP/REST for client-initiated sends and syncs; WebSocket (`wss://...`) for server-initiated real-time events (new_message, message_read, contact_status_update). Reject polling/long polling/SSE for latency-sensitive chat; limit WebSocket use to real-time only to control scaling complexity.
- **Idempotency**: `requestId` on sends lets the backend de-duplicate retries.
- **Message ordering**: hybrid — server-acknowledged messages order by server `messageId`; pending/in-flight messages order by client `createdAt` and always appear at the end.
- **Message lifecycle**: client creates MessageRequest (status DRAFT/PENDING/SENT/FAILED) → on server ack, delete the request and insert a Message with the backend ID (no SUCCEEDED state in the request model).
- **Storage**: SQLite (Room / Core Data) relational DB; split `Messages` (synced) and `MessageRequests` (unsynced) tables in one `chats.db`; merge behind the repository.
- **Push**: FCM/APNs only as a lightweight alert channel (not a real-time transport).

## Key Concepts & Components
- **WebSocket vs SSE**: WebSocket is bidirectional and lower-overhead for frequent small messages (typing, receipts); SSE is one-way.
- **MessageStatus**: PENDING → SYNCED → DELIVERED → READ drives UI indicators.
- **Exponential backoff + max retry limit**: stop retrying permanently-failed sends and let the user retry/delete.
- **Messages Scheduler / Timeout Controller / Pending Messages Provider**: components that keep the remote data source lean.
- **DB performance**: index frequently-searched columns, batch transactions, background-thread access, per-user DB splitting as scale grows.

## Trade-offs & Anti-patterns
- **Sorting by client timestamp alone**: device clock drift breaks order — combine with server IDs.
- **WebSocket for all traffic**: persistent connections are hard to scale/load-balance — reserve for real-time.
- **Push as delivery mechanism**: throttling/delivery gaps make it unsuitable for in-session messaging.
- **Multiple DB files for FK-linked tables**: breaks referential integrity — keep Users/Messages/MessageRequests in one DB.

## Key Takeaways
1. Split client-initiated (HTTP) from server-initiated (WebSocket) traffic for maintainability and scale.
2. Make the backend the source of truth for IDs; order acknowledged messages by server ID.
3. Persist unsynced requests separately and merge at the repository so the UI sees one conversation.

## Connects To
- **02-news-feed-app**: shared layered/UDF foundation; compare optimistic writes vs message states.
- **06-hotel-reservation-app**: idempotency keys also prevent double bookings there.
- **09-mobile-system-design-building-blocks**: storage options, push notification limits, pagination for history.
