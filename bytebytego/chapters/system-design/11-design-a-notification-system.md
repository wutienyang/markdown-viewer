# 11: Design A Notification System

## Core Idea
Build a soft-real-time notification system that fans out push/SMS/email through message-queue-backed workers to third-party providers, with reliability (at-least-once), dedupe, and user opt-out handled explicitly.

## Design Framework / Approach
1. Clarify: types (push, SMS, email), soft real-time, devices, triggers (client + server-scheduled), opt-out, daily volume (10M push, 1M SMS, 5M email).
2. Model each channel: iOS → APNS, Android → FCM, SMS → Twilio/Nexmo, email → Sendgrid/Mailchimp.
3. Gather contact info (device tokens, phone, email) into DB tables at signup.
4. Build sending flow: Services → Notification servers (validate, fetch metadata) → message queues → workers → third-party providers → devices.
5. Improve the initial single-server design: move DB/cache out, scale notification servers horizontally, decouple with queues.
6. Deep dive reliability + extras: retry, dedupe, templates, settings, rate limiting, security, monitoring, event tracking.

## Key Concepts & Components
- **APNS / FCM**: Apple and Android push services reached via provider + device token + payload.
- **Message queues (per channel)**: buffer bursts and isolate outages so one provider failing doesn't block others.
- **Workers**: pull notification events and deliver to third parties.
- **At-least-once delivery**: exactly-once is impossible; persist to a notification log DB + retry, and dedupe by event ID.
- **Notification template**: preformatted message customized with params (consistent format, fewer errors, faster).
- **Notification setting / opt-in**: check channel opt-in before sending.
- **Rate limiting + retry + appKey/appSecret**: protect users and secure the send APIs.

## Trade-offs & Anti-patterns
- **Single notification server**: SPOF, hard to scale, and a performance bottleneck — decouple with queues and multiple servers.
- **Shared queue across channels**: one provider outage cascades; use a distinct queue per notification type.
- **Assuming exactly-once**: accept occasional duplicates and dedupe instead of engineering impossible guarantees.

## Key Takeaways
1. Decouple with per-channel message queues so each provider failure is isolated and buffers absorb peaks.
2. Guarantee at-least-once via persistence + retry, then dedupe by event ID.
3. Respect opt-in settings and cap frequency to avoid user churn.

## Connects To
- **02-scale-from-zero-to-millions-of-users**: message queues, cache/DB separation, horizontal scaling.
- **05-design-a-rate-limiter**: per-user notification caps.
- **12-design-a-news-feed-system**: fanout/notification service triggers push on new posts.
- **13-design-a-chat-system**: push notification for offline message delivery.
