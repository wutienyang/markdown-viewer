# 00: Introduction and Overview

## Core Idea
ML systems in production are far more than model training. Use a structured 7-step framework to turn a vague design prompt into a defensible end-to-end ML system.

## Design Framework / Approach
Walk through the ML system design steps, in order, but stay flexible to the interviewer's focus:
1. **Clarifying requirements** — business objective, features, data, constraints, scale, performance.
2. **Frame the problem as an ML task** — translate business goal into an ML objective, specify input/output, pick the ML category.
3. **Data preparation** — data engineering + feature engineering.
4. **Model development** — model selection + training.
5. **Evaluation** — offline + online metrics.
6. **Deployment & serving** — cloud vs on-device, compression, testing, prediction pipeline.
7. **Monitoring & infrastructure**.

## Key Concepts & Components
- **ML objective**: a well-defined, learnable target (e.g. "maximize click-through rate") derived from a fuzzy business goal.
- **ML category**: supervised (classification/regression), unsupervised, or reinforcement learning; most real systems are supervised.
- **Feature engineering operations**: handle missing values, feature scaling (normalization/standardization/log), discretization (bucketing), encoding categorical features (integer, one-hot, embedding learning).
- **Labels**: hand labeling (accurate, expensive) vs natural labeling (automatic, noisy).
- **Class imbalance**: address via resampling (over/under) or loss alteration (class-balanced loss, focal loss).
- **Offline vs online metrics**: offline measures model quality in dev (precision/recall, MSE, nDCG); online measures business impact (CTR, watch time, revenue).
- **Model compression**: knowledge distillation, pruning, quantization.
- **Test in production**: shadow deployment, A/B testing, canary release, interleaving, bandits.
- **Batch vs online prediction**: batch pre-computes; online returns predictions as requests arrive.

## Trade-offs & Anti-patterns
- **Deletion vs imputation for missing values**: deletion shrinks training data; imputation injects noise.
- **Complex model vs interpretability**: more parameters improve accuracy but obscure reasoning.
- **Shadow deployment**: risk-free but doubles prediction cost.
- **Batch prediction**: less responsive to changing preferences; only works when you know what to precompute.
- **Data distribution shift**: the top reason models fail in production; train on large data and retrain regularly.

## Key Takeaways
1. Always write down the agreed requirements/constraints before designing.
2. Choose a simple baseline, then escalate model complexity only if results demand it.
3. Prefer natural labels for training (cheap) and hand labels for evaluation (accurate).

## Connects To
- **Every subsequent chapter**: each is a worked example of this framework.
- **05-video-recommendation-system**: uses the multi-stage candidate generation → scoring pipeline previewed here.
