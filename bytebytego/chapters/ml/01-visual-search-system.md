# 01: Visual Search System

## Core Idea
Build a system (like Pinterest) that retrieves and ranks images visually similar to a query image, using representation learning so similar images sit close together in embedding space.

## Design Framework / Approach
Frame as a **ranking problem** solved via **representation learning**: a CNN/Transformer maps each image to an embedding; similarity is measured by distance in embedding space; results are ranked by that score. Train with **contrastive training** so positive (similar) images pull closer than negatives.

## Key Concepts & Components
- **Representation learning / embeddings**: mapping inputs to N-dimensional vectors where distance encodes similarity.
- **Contrastive training**: teach the model to distinguish a query from similar vs dissimilar images; frameworks include **SimCLR** and **MoCo**.
- **Model architecture**: ResNet (CNN) or ViT (Transformer); hyperparameters tuned by experiment.
- **Training data construction**: positive pairs via human judgment, click signals, or **self-supervision** (augmentation) — chosen here for zero up-front cost and scale.
- **Contrastive loss**: compute similarities (dot product / cosine), apply softmax, then cross-entropy; avoid Euclidean distance in high dimensions (curse of dimensionality).
- **Nearest neighbor service**: retrieve top-k similar embeddings via **approximate nearest neighbor (ANN)** (Faiss, ScaNN) since exact linear search is O(N·D) and too slow at billions of images.
- **Offline metrics**: MRR, Recall@k, Precision@k, mAP, nDCG — nDCG chosen because it handles non-binary relevance scores.
- **Online metrics**: CTR; time spent on suggested images.

## Trade-offs & Anti-patterns
- **Click-signal labels**: free but noisy and sparse; **augmentation labels**: clean but differ from real-world similarity.
- **MRR**: ignores everything after the first relevant item; **Recall@k**: weak when total relevant items is huge.
- **Exact vs ANN**: exact is accurate but impractical at scale — prefer ANN.
- **Indexing embeddings** increases memory; use vector/product quantization to compress.

## Key Takeaways
1. Prefer self-supervised (augmentation-based) labels to bootstrap, then fold in click data or human review later.
2. Use nDCG over MRR/Recall@k when relevance is graded and you care about ranking quality.
3. Keep a re-ranking service to apply business rules (filter inappropriate, dedupe) before display.

## Connects To
- **03-youtube-video-search**: same contrastive + ANN pattern extended to text↔video.
- **08-similar-listings**: another embedding-learned-by-co-occurrence system.
