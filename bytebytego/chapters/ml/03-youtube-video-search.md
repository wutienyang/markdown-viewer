# 03: YouTube Video Search

## Core Idea
Design a text-to-video search system over ~1B videos, combining a learned visual-search path (text↔video embeddings) with a text-search path (inverted index / Elasticsearch), fused into one ranked list.

## Design Framework / Approach
Frame as a ranking problem. Two encoders — a **text encoder** and a **video encoder** — map query and video into a shared embedding space; similarity is a dot product; results are ranked. A separate **text search** component (Elasticsearch over titles/tags/descriptions) complements visual search, and a **fusing layer** merges the two ranked lists by weighted score.

## Key Concepts & Components
- **Text encoder options**: statistical (BoW, TF-IDF — fast but no semantics, sparse) vs ML-based (embedding layer, Word2vec, Transformer/BERT). Prefer **Transformer (BERT)** for context-aware embeddings.
- **Video encoder options**: **video-level** (3D conv / Transformer, expensive, captures temporal) vs **frame-level** (sample frames → embed → aggregate, e.g. ViT). Choose frame-level for speed when temporal nuance isn't critical.
- **Text preprocessing**: normalization (lowercase, strip accents, stemming), tokenization (word/subword/char), tokens→IDs via lookup table vs **feature hashing**.
- **Contrastive training**: same loss mechanics as visual search (Chapter 1).
- **Fusing layer**: re-rank by weighted sum of scores (cheap) rather than training a fusion model.
- **Auto-tagger**: standalone model generating tags when uploaders omit them.
- **Offline metric**: **MRR** (one relevant video per query makes Precision@k/mAP weak, Recall@k binary).
- **Online metrics**: CTR, video completion rate, total watch time.

## Trade-offs & Anti-patterns
- **BoW/TF-IDF**: fast but ignore word order and semantics; TF-IDF down-weights frequent words but still sparse.
- **Lookup table vs hashing**: lookup is fast and reversible but memory-heavy and fails on unseen tokens; hashing is memory-light but collisions possible.
- **Recall@k**: collapses to 0/1 when only one video is relevant — MRR captures relative quality better.
- **CTR**: can't distinguish clickbait from relevance — supplement with watch time.

## Key Takeaways
1. Use a two-tower text/video encoder with dot-product similarity for the visual path.
2. Fuse visual + text results by weighted score, not a trained model, to keep serving fast.
3. Prefer frame-level video encoders unless actions/motion are essential.

## Connects To
- **01-visual-search-system**: shares contrastive learning and ANN retrieval.
- **05-video-recommendation-system**: both index video embeddings and retrieve nearest neighbors.
