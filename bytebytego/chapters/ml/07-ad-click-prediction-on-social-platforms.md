# 07: Ad Click Prediction on Social Platforms

## Core Idea
Design a high-cardinality, sparse-feature ad click predictor framed as **pointwise LTR** binary classification, optimized with models that capture feature interactions and support continual learning.

## Design Framework / Approach
Frame as ranking via pointwise LTR: a binary classifier takes ⟨user, ad⟩ and predicts click probability. Because the feature space is huge and sparse with many categorical IDs, choose models that model feature interactions: start with **logistic regression baseline**, then **DCN** and **DeepFM** (not plain NN, which struggles with sparsity).

## Key Concepts & Components
- **Model options**: LR (fast baseline, linear-only) → feature crossing + LR (manual, domain-dependent, sparse) → GBDT (no continual learning) → GBDT+LR (feature selection/extraction) → NN (poor on sparse pairwise interactions) → **DCN** (deep + cross network, auto feature crosses) → **FM/DeepFM** (embedding-based pairwise interactions + DNN).
- **Factorization Machines (FM)**: learns an embedding per feature; pairwise interaction = dot product of embeddings; extends LR's linear term.
- **Feature engineering**: embedding layers for high-cardinality IDs, pre-trained model (SimCLR) for image/video, category encodings, impression/click counts.
- **Labeling**: positive = clicked within t seconds; negative = impression not clicked (or "hide this ad"); tune t.
- **Continual learning**: critical — even 5-minute delays degrade performance.
- **Offline metrics**: cross-entropy (CE) and **normalized cross-entropy (NCE)** (model CE / background-CTR CE; <1 means beats baseline).
- **Online metrics**: CTR, conversion rate, revenue lift, hide rate.
- **Serving**: batch vs online feature computation; continual learning pipeline; candidate generation (targeting criteria) → ranking → re-ranking.

## Trade-offs & Anti-patterns
- **Feature crossing is manual** and explodes cardinality/sparsity — prefer automatic crossing (DCN/FM).
- **GBDT can't train embedding layers or fine-tune** — poor fit for continually-updated sparse-ID models.
- **CTR alone** misses conversion quality; track hide rate to catch irrelevant ads.

## Key Takeaways
1. Prefer embedding-based models (FM, DeepFM, DCN) over plain NN/LR for sparse, high-cardinality features.
2. Make continual learning a first-class pipeline; label impressions that don't convert as negatives.
3. Use NCE (not raw CE) to judge models against a background-CTR baseline.

## Connects To
- **06-event-recommendation-system**: shares pointwise LTR, GBDT-vs-NN trade-offs, class imbalance.
- **09-personalized-news-feed**: same batch-vs-online feature and continual-learning infra.
