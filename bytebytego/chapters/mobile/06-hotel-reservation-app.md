# 06: Hotel reservation app

## Core Idea
Design an aggregator hotel booking app (5M MAU) that prevents double bookings. Key decisions: REST+JSON, idempotent reservation requests, server-authoritative reservation holds with device-uptime countdowns, FTS-backed autocomplete, and client-side PSP payments.

## Design Framework / Approach
- **Protocol**: HTTP + REST with JSON (no real-time requirement).
- **Reservation holds**: backend fixes a ~15-minute window (source of truth = server expiration UTC timestamp); auto-release unpaid holds; visible countdown drives urgency.
- **Timer accuracy**: combine the server expiration timestamp with local device uptime (`systemUptime` / `SystemClock.elapsedRealtime()`), immune to user clock changes and app suspension.
- **Idempotency**: `requestId` on `POST /v1/reservations` prevents duplicate bookings on network retries.
- **Autocomplete**: hybrid of pre-fetched popular data + on-demand loading; debounce input 200-300ms; store in SQLite with Full-Text Search (FTS) for prefix matching, tokenization, and fuzzy tolerance.
- **Payments**: client integrates Payment Service Providers (Stripe/PayPal) directly for a native experience; tokenization avoids storing card data; backend verifies with PSP before capture.

## Key Concepts & Components
- **Reservation Timing Controller / Reservation Timer**: separation-of-concerns for hold logic (data layer) vs display (UI layer).
- **FTS (Full-Text Search)**: fast prefix matching and typo tolerance via SQLite FTS (Room on Android; GRDB/direct SQLite on iOS).
- **Tokenization**: replace card data with PSP tokens; store only last-4 digits + token reference.
- **Two-step PSP flow**: authorize (reserve funds) then capture (move money) — backend verifies reservation before capture.
- **ChangeList / timestamp sync**: delta-based autocomplete cache updates to save bandwidth.

## Trade-offs & Anti-patterns
- **Relying on device wall clock for holds**: manual clock changes and suspension break timers — use server timestamp + device uptime.
- **Direct payment processor integration**: heavy PCI DSS burden — prefer established PSPs.
- **Real-time remote autocomplete per keystroke**: latency and data cost — pre-fetch popular terms locally.
- **Storing full card details on device**: only volatile memory during transaction, then tokens.

## Key Takeaways
1. Make the backend the authoritative source for reservation expiration; render countdown via device uptime.
2. Add idempotency keys to state-changing POSTs to prevent double-booking.
3. Pre-fetch popular autocomplete data with FTS, and defer personalization to on-demand fetches.

## Connects To
- **03-chat-app**: idempotency keys and server-authoritative state recur in message sends.
- **07-google-drive-app**: shared tokenization/encryption and API Gateway patterns.
- **09-mobile-system-design-building-blocks**: FTS, secure storage, and API design conventions.
