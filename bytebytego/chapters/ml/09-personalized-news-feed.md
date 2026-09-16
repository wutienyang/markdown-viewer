# 09: Personalized News Feed

## Core Idea
Design a Facebook/LinkedIn-style feed that ranks unseen posts (or posts with unseen comments) by engagement, using **pointwise LTR** over a weighted multi-reaction objective and a **multi-task DNN**.

## Design Framework / Approach
Frame as ranking via pointwise LTR. Several binary classifiers predict the probability of each reaction (click, like, share, comment, friendship request, hide, block), and a weighted sum produces the **engagement score** (weights per business value). Use a **multi-task DNN** (not N independent DNNs) to share learning across reactions, extended with dwell-time and skip tasks for passive users.

## Key Concepts & Components
- **ML objective**: blended weighted score of implicit + explicit reactions (chosen over pure clicks — clickbait, or pure explicit — sparse).
- **Engagement score**: sum over reactions of (predicted probability × reaction weight); negative weights for hide/block.
- **Feature engineering**: post features (BERT text, CLIP/ResNet images, reactions, hashtags via Viterbi tokenization + feature hashing + TF-IDF, post age buckets); user features (demographics, context, historical interactions, being mentioned); **user-author affinities** (like/click rate, friendship length, close friend/family — among the most predictive).
- **Multi-task DNN**: shared layers + per-task heads; add **dwell-time** (regression) and **skip** tasks for passive users.
- **Loss**: per-task binary cross-entropy + regression loss (MAE/MSE/Huber) for dwell time, combined.
- **Offline metric**: ROC-AUC; online: CTR, reaction rates, total time spent, user survey satisfaction.
- **Serving**: retrieval (unseen posts) → ranking (engagement score) → re-ranking.

## Trade-offs & Anti-patterns
- **Implicit-only objective**: abundant data but noisy; **explicit-only**: strong signal but sparse — blend them.
- **N independent DNNs**: expensive and starved for rare reactions — prefer multi-task.
- **Hashtags**: use TF-IDF/word2vec, not Transformers, since context is usually unnecessary.

## Key Takeaways
1. Weight reactions by business value and optimize a blended engagement score.
2. Use a multi-task DNN and add dwell-time/skip tasks to cover passive users.
3. Engineer user-author affinity features — they are among the strongest engagement predictors.

## Connects To
- **04-harmful-content-detection**: both use multi-task DNNs with task-specific losses.
- **07-ad-click-prediction**: shared batch-vs-online feature and continual-learning infra.
