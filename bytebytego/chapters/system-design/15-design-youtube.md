# 15: Design YouTube

## Core Idea
A video platform splits into upload and streaming flows: leverage CDN + blob storage, transcode uploads through a DAG-based pipeline, and stream transcoded files from the CDN — cutting costs by exploiting the long-tail popularity of videos.

## Design Framework / Approach
1. Clarify: upload + watch only, mobile/web/smart TV, 5M DAU, 30 min/day, international, most resolutions/formats, encryption, max 1 GB, leverage cloud.
2. Back-of-envelope: 150 TB/day storage; CDN cost ~$150k/day — CDN is the dominant cost.
3. High level: **Client · CDN (video streaming) · API servers (everything else)**.
4. **Upload flow**: client → LB → API servers → original blob storage; transcoding servers → transcoded storage → CDN; completion queue + handler update metadata DB/cache.
5. **Streaming flow**: stream directly from CDN via a streaming protocol (MPEG-DASH, HLS, Smooth Streaming, HDS).
6. Deep dive: transcoding (DAG model + architecture), then speed/safety/cost optimizations and error handling.

## Key Concepts & Components
- **Transcoding (video encoding)**: convert formats for device/browser compatibility, quality tiers, and adaptive bitrate.
- **Container vs codec**: container (.mp4/.mov) holds video+audio+metadata; codec (H.264, VP9, HEVC) compresses.
- **DAG model**: split video → audio → metadata into staged tasks (inspection, encoding, thumbnail, watermark) executed sequentially or in parallel.
- **Transcoding architecture**: Preprocessor (GOP splitting, DAG generation, cache) → DAG scheduler → resource manager (task/worker/running queues) → task workers → temporary storage → encoded video.
- **GOP (Group of Pictures)**: independently playable chunks (a few seconds) enabling parallel/resumable uploads.
- **Pre-signed URL**: grants authorized upload directly to object storage (Azure: Shared Access Signature).
- **Protection**: DRM (FairPlay/Widevine/PlayReady), AES encryption, visual watermarking.
- **Long-tail distribution**: few popular videos dominate; serve only popular videos from CDN, the rest from video servers; encode short videos on-demand; distribute regionally popular videos only regionally.

## Trade-offs & Anti-patterns
- **Building CDN/blob storage from scratch**: extremely complex and costly — Netflix uses AWS, Facebook uses Akamai; leverage cloud.
- **Streaming vs downloading**: streaming sends a little data at a time for immediate playback; don't download whole videos.
- **Tight coupling between pipeline stages**: output waits on input; introduce message queues for parallelism.
- **Encoding every video into all formats**: wastes storage for rarely-watched long-tail videos; encode on-demand.

## Key Takeaways
1. Keep video streaming on the CDN and route everything else through stateless API servers.
2. Model transcoding as a DAG and decouple stages with message queues for parallelism and resilience.
3. Cut CDN cost by serving only popular content from the CDN (long-tail), region-scoping, and on-demand encoding.

## Connects To
- **02-scale-from-zero-to-millions-of-users**: CDN, message queues, stateless tiers, DB replication/sharding.
- **11-design-a-notification-system**: completion queue → worker pattern reuse.
- **03-back-of-the-envelope-estimation**: CDN cost math.
- **13-design-a-chat-system**: media attachment handling (compression, thumbnails, storage).
