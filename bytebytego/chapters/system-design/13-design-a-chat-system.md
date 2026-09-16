# 13: Design A Chat System

## Core Idea
A chat system uses WebSocket for persistent, bidirectional client↔server connections, a key-value store for chat history, and presence servers for online status — with stateless services handling the rest.

## Design Framework / Approach
1. Clarify: 1-on-1 + small group (≤100), mobile + web, 50M DAU, text only (<100k chars), online indicator, multi-device, push, store forever.
2. Choose the receive protocol: polling → long polling → **WebSocket** (bidirectional, persistent, port 80/443, firewall-friendly). Use HTTP/keep-alive for sending if needed.
3. Split the system: **stateless services** (login/profile, service discovery), **stateful chat service** (persistent connections), **third-party integration** (push notifications).
4. Choose storage: relational for generic data; **key-value store** for chat history (horizontal scaling, low latency, avoids long-tail index cost).
5. Design message tables and message IDs; then deep dive service discovery, message flows, and online presence.

## Key Concepts & Components
- **WebSocket vs long polling vs polling**: WebSocket upgrades a HTTP connection to persistent bidirectional; long polling holds requests open but is stateless-prone; polling is wasteful.
- **Service discovery (Zookeeper)**: registers chat servers and picks the best one per client (geography, capacity).
- **Message sync queue / inbox**: each recipient has an inbox; group chat copies the message to each member's inbox (fine for ≤100 members; WeChat caps at 500).
- **Message ID**: must be unique and time-sortable — snowflake or local sequence per channel; not `created_at`.
- **1-on-1 message table**: PK `message_id`. **Group chat table**: composite PK `(channel_id, message_id)` with channel as partition key.
- **cur_max_message_id**: per-device cursor for syncing across multiple devices.
- **Heartbeat mechanism**: periodic client heartbeats; offline after no heartbeat within x seconds (avoids status flapping on brief disconnects).
- **Presence fanout**: publish-subscribe channels per friend pair; for huge groups, fetch status on-demand instead.

## Trade-offs & Anti-patterns
- **Single-server design**: a single point of failure — acceptable only as a starting point, never the final answer.
- **Long polling**: sender/receiver may hit different servers; no clean disconnect detection; still periodic connections.
- **Relational DB for chat history**: poor long-tail handling and expensive random access at large indexes.
- **Storing a message copy per member in huge groups**: too expensive; only for small groups.

## Key Takeaways
1. Use WebSocket for real-time messaging; keep everything else on HTTP.
2. Store chat history in a key-value store and order messages with time-sortable IDs.
3. Detect presence with heartbeats and fan out status via pub-sub channels.

## Connects To
- **07-design-a-key-value-store**: chat history storage (HBase/Cassandra in practice).
- **08-design-a-unique-id-generator-in-distributed-systems**: snowflake message IDs.
- **11-design-a-notification-system**: push notifications for offline messages.
