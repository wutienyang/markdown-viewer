# 08: YouTube app

## Core Idea
Design a video-consumption app at ~1B DAU. Key decisions: REST with HTTP field selection (`part` parameter) to limit over-fetching, adaptive bitrate streaming via HLS/DASH, native players (ExoPlayer/AVPlayer), and intelligent prefetching.

## Design Framework / Approach
- **Protocol**: REST + JSON; use the `part` parameter to fetch only needed field sets (snippet/statistics/player) — GraphQL-like control with less overhead.
- **Playback**: feed streaming manifests directly to native players; HLS/DASH with adaptive bitrate streaming (ABR) auto-adjust quality by network/buffer/CPU.
- **CDN**: essential for scale and cost; Netflix built Open Connect rather than pay a third-party CDN.
- **Thumbnails (seek previews)**: use low-resolution adaptive streams (144p/240p) instead of pre-generated sprite sheets.
- **Prefetching**: intelligent prefetching guided by device state, user patterns, and relevance scoring (relevanceScore + ttl) via remote config; schedule with WorkManager / Background Tasks.
- **Enhanced UX**: gesture controls, background audio playback (audio-only streams), and Picture-in-Picture.

## Key Concepts & Components
- **Adaptive bitrate streaming**: multi-quality encodes, small segments (2-10s), real-time quality switching with buffer/throughput algorithms.
- **Separate tracks**: video/audio/subtitle as independent streams (WebVTT/TTML) for bandwidth, multi-language, and accessibility.
- **Native players**: ExoPlayer (Android) / AVPlayer (iOS) for hardware decoding and playback control.
- **Recommendations Prefetching Service + Device Monitor**: background prefetch gated on battery/network.
- **GestureDetector / VideoControlHandler**: gesture-based controls with conflict resolution.

## Trade-offs & Anti-patterns
- **JSON at huge scale**: payload bloat — gRPC/Protobuf is the compact alternative.
- **Full download before playback**: streaming with progressive segments reduces memory and start latency.
- **Naive time-based prefetch**: wastes data — signal-driven intelligent prefetch adapts to user/device.
- **Sprite sheets on mobile**: extra assets to store/maintain — adaptive low-res streams reuse existing infrastructure.

## Key Takeaways
1. Limit over-fetching with HTTP field selection (`part`) to save bandwidth at scale.
2. Delegate adaptive streaming to native players; focus design on CDN placement and manifest delivery.
3. Gate prefetching on device state and relevance scores, and measure prefetch effectiveness (bytes watched vs prefetched).

## Connects To
- **04-stock-trading-app**: shared WebView/JS-bridge and adaptive-quality/buffering techniques.
- **02-news-feed-app**: list vs detail model separation mirrors the `part` field-selection idea.
- **09-mobile-system-design-building-blocks**: CDN, performance, app size, and prefetching trade-offs.
