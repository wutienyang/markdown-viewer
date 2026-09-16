# 05: Video Recommendation System

## Core Idea
Design a YouTube-like homepage recommender over ~10B videos using a multi-stage pipeline: candidate generation (fast, coarse) → scoring (accurate, heavy) → re-ranking.

## Design Framework / Approach
Choose **hybrid filtering** (CF for candidate generation + content-based for scoring), optimizing for "relevant videos" defined by explicit+implicit feedback. Serve via **two-stage design**: a lightweight **two-tower neural network** narrows 10B→thousands (candidate generation), then a heavier content-based model ranks them (scoring), then re-ranking applies business rules.

## Key Concepts & Components
- **Recommendation approaches**: content-based (video features; good for new items, no new-interest discovery), collaborative filtering (interactions only; discovers interests, cold-start problem), hybrid (sequential combo — chosen).
- **ML objective trade-offs**: clicks (clickbait risk), completed videos (favors short), watch time, vs "relevant videos" (defined by rules — chosen for control).
- **Feedback matrix**: explicit (sparse) vs implicit (noisy) feedback; combine both to match the relevance objective.
- **Matrix factorization**: decompose feedback matrix into user/video embeddings; use **WALS** (faster, parallel) over SGD; loss = weighted combination of observed + unobserved pairs.
- **Two-tower neural network**: user tower + video tower; handles user features and new users (vs MF), but slower serving and costlier training.
- **Candidate generation → scoring → re-ranking**: prioritize efficiency in stage 1, accuracy in stage 2.
- **Offline metrics**: Precision@k, mAP, **diversity** (low pairwise similarity); online: CTR, completed videos, watch time, explicit feedback.
- **Cold-start**: new users → features (age/gender); new videos → show to random users, then fine-tune.

## Trade-offs & Anti-patterns
- **MF vs two-tower**: MF is cheap/fast but can't use features or handle new users; two-tower is flexible but slower.
- **Squared-distance loss over only observed pairs** collapses (all-ones embeddings); over all pairs lets unobserved dominate — use a weighted combination.
- **Diversity alone** can mislead — pair it with relevance metrics.

## Key Takeaways
1. Always use a multi-stage candidate generation → scoring pipeline when item count is huge and latency is tight (~200ms).
2. Use multiple candidate generators (popular, location, content) to diversify the candidate pool.
3. Pick a relevance-based ML objective to avoid clickbait and short-video bias.

## Connects To
- **01-visual-search-system**: shared ANN retrieval of embeddings.
- **07-ad-click-prediction**: both use two-stage candidate generation + ranking.
