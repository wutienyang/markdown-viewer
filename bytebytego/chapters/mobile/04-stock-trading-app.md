# 04: Stock trading app

## Core Idea
Design a real-time stock trading app (500k DAU) where latency and correctness are financial, not cosmetic. Key decisions: REST + WebSocket hybrid, BigDecimal/Decimal for money, in-memory-only caching for live prices, and WebView charts with buffered updates.

## Design Framework / Approach
- **Protocols**: REST for client-initiated orders/portfolio/history; WebSocket (`wss://api.stocktrading.com/ws`) for `stock-prices`, `order-updates`, `portfolio-updates`.
- **API Gateway**: front door for auth, rate limiting, traffic management, and monitoring — non-negotiable for financial security.
- **Money types**: always use BigDecimal (Kotlin) / Decimal (Swift), never Float/Double — floating-point rounding is unacceptable.
- **Data storage**: in-memory caching only for real-time market data (never disk, to avoid stale prices); disk cache with expiration for historical charts and preferences.
- **Charts**: WebView-based rendering (D3.js/TradingView) for cross-platform consistency; isolate from order flow.
- **Real-time updates**: buffered updates (queue + scheduled updater every 1-2s) rather than direct per-tick UI updates.
- **JavaScript bridge**: native code owns the WebSocket, buffers and pre-processes data, then pushes to the WebView chart.

## Key Concepts & Components
- **Buffered updates vs direct vs priority-based**: buffer to smooth frequent ticks and save battery; switch to priority-based if multiple charts stream at once.
- **Phased loading**: load low-resolution history first, higher resolution on demand.
- **Partial redraws**: update only changed chart elements; disable animations during high-frequency updates.
- **Adaptive scheduling**: increase frequency during volatile market hours; stop background updates; exponential backoff on reconnect.
- **WebSocket message filtering**: server-side so clients receive only subscribed symbols.

## Trade-offs & Anti-patterns
- **Float/Double for money**: silent rounding errors corrupt financial data.
- **Direct per-tick UI updates**: jank and battery drain — buffer instead.
- **Persisting live prices to disk**: risks stale data driving decisions — keep in memory only.
- **Native graphics for charts at multi-client scale**: heavy cross-platform duplication — WebView gives consistency (Robinhood's native Spark is the performance-first alternative).

## Key Takeaways
1. Treat money as a first-class correctness concern; use exact decimal types end to end.
2. Buffer real-time updates and push through a JS bridge to keep WebView charts smooth and battery-friendly.
3. Scope WebSocket usage and filter server-side as data volume grows.

## Connects To
- **03-chat-app**: same REST+WebSocket hybrid rationale, applied to market data instead of messages.
- **08-youtube-app**: shared WebView/JS-bridge and adaptive-quality techniques for media delivery.
- **09-mobile-system-design-building-blocks**: secure storage, API Gateway, and offline/caching trade-offs.
