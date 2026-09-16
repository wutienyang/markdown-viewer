# 06: Event Recommendation System

## Core Idea
Design an Eventbrite-like recommender where events are ephemeral and intrinsically cold-start, using **pointwise Learning to Rank** as a binary classifier plus heavy feature engineering.

## Design Framework / Approach
Frame as a ranking problem solved with **pointwise LTR**: a binary classifier predicts P(user registers | event) per ⟨user, event⟩ pair, then ranks. Because events have few historical interactions (constant new-item problem), invest heavily in engineered features — location, time, social, user, and event features — and support **continual learning** via a neural network.

## Key Concepts & Components
- **Learning to Rank (LTR)**: pointwise (score each item independently — chosen for simplicity), pairwise (RankNet, LambdaRank, LambdaMART), listwise (SoftRank, ListNet, AdaRank). Pairwise/listwise are more accurate but harder to train.
- **Location features**: walk/transit/bike scores + similarity, same city/country flags, bucketed distance + distance similarity.
- **Time features**: remaining time until event (bucketed), travel time, per-day/per-hour user profile vectors, similarity features.
- **Social features**: registrations count/ratio, friends attending, invitations, host-is-friend, prior host attendance.
- **Model selection**: logistic regression (fast, linear-only), decision tree (overfits → bagging/boosting), **GBDT/XGBoost** (baseline, but no continual learning), **neural network** (non-linear, fine-tunable — ideal for continual learning).
- **Feature types**: batch/static (from feature store) vs streaming/dynamic (computed in real time).
- **Class imbalance**: focal loss / class-balanced loss, or undersample the majority.
- **Offline metric**: **mAP** (binary relevance fits); online: CTR, conversion rate, bookmark rate, revenue lift.
- **Serving**: event filtering (rule-based, 1M→hundreds) → ranking service.

## Trade-offs & Anti-patterns
- **GBDT is unsuitable for continual learning** — must retrain from scratch on streaming data.
- **MRR/nDCG misapplied**: MRR suits single-relevant-item systems; nDCG suits graded relevance. Use mAP for binary.
- **Creating user-attribute features** (age/gender) can introduce bias/discrimination — be deliberate.

## Key Takeaways
1. Treat ephemeral/one-time items as a cold-start problem and compensate with rich engineered features.
2. Start with XGBoost for a baseline, then move to a fine-tunable neural network for continual learning.
3. Bucket continuous features and add "similarity-to-user-history" features to capture personal preferences.

## Connects To
- **07-ad-click-prediction**: same pointwise LTR + binary classification framing and GBDT/NN trade-offs.
- **09-personalized-news-feed**: both use weighted engagement objectives and multi-task models.
