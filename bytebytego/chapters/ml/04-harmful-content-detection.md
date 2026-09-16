# 04: Harmful Content Detection

## Core Idea
Design a proactive system that detects harmful multimodal posts (text/image/video, multilingual), removes or demotes them, and explains why — framed as **multi-task classification** with early fusion.

## Design Framework / Approach
Frame each harm class (violence, nudity, hate speech…) as a binary task and train a single **multi-task neural network** with shared layers + task-specific heads. Use **early fusion** (fuse modalities first, then predict) so benign-alone-but-harmful-combined cases (memes) are caught.

## Key Concepts & Components
- **Late vs early fusion**: late trains each modality independently (modular but misses cross-modality harm); early fuses first (captures combined harm, needs one unified model). Choose early fusion.
- **Classification framing options**: single binary (can't explain/improve per class) → one classifier per class (expensive) → multi-label (shared model) → **multi-task** (shared layers + per-class heads; shares data across tasks). Multi-task wins.
- **Feature engineering**: text via multilingual **DistilmBERT** (fast, multilingual vs BERT); images via CLIP visual encoder / SimCLR; video via VideoMoCo; user reactions (counts, aggregated comment embeddings); author features (violation history, profane rate); contextual (time of day, device).
- **Labels**: hand labeling for eval (accurate), natural labeling (user reports) for training (fast).
- **Overfitting in multimodal training**: gradient blending / focal loss when one modality dominates.
- **Offline metrics**: **ROC-AUC** and **PR-AUC**.
- **Online metrics**: **prevalence** (missed harmful posts), **harmful impressions** (preferred — counts people affected), **valid appeals**, **proactive rate**, user reports per class.
- **Serving**: high-confidence → immediate takedown; low-confidence → **demoting service** + human review, feeding labeled posts back into training.

## Trade-offs & Anti-patterns
- **Prevalence treats all harmful posts equally** — prefer harmful impressions to weight by reach.
- **Single binary classifier**: can't explain takedowns or diagnose per-class failures.
- **Hand labeling** is accurate but slow/biased; **natural labeling** is fast but noisy.

## Key Takeaways
1. Prefer early fusion when a post can be harmful only through modality combination.
2. Use multi-task learning to share data across harm classes and keep a single model maintainable.
3. Route by confidence: auto-remove high-confidence, demote + human-review low-confidence, and recycle reviews into training data.

## Connects To
- **02-google-street-view-blurring-system**: both safety systems with human review loops.
- **09-personalized-news-feed**: both use multi-task DNNs with task-specific losses.
