# 00: Introduction and Overview

## Core Idea
The book equips ML engineers to pass GenAI system design interviews by mapping every design question to a reusable 7-step framework, after grounding candidates in discriminative vs. generative models and the three levers (data, model capacity, compute) that make modern GenAI work.

## Design Framework / Approach
Use the 7-step framework in order when answering any open-ended GenAI design question:
1. **Clarifying requirements** — split into functional (what the system does) and non-functional (latency, throughput, fairness, scalability) requirements.
2. **Framing the problem as an ML task** — specify input/output modalities, then pick an approach in three narrowing steps: discriminative vs. generative → task type (classification/regression vs. text/image/audio/video generation) → specific algorithm.
3. **Data preparation** — for GenAI, shift from feature engineering to collection, cleaning (NSFW filtering, quality scoring, dedup), and efficiency (storage/retrieval).
4. **Model development** — architecture selection, training methodology, ML objective + loss, task-specific mitigations.
5. **Evaluation** — offline + online metrics.
6. **Overall ML system design** — pipelines and services around the model.
7. **Deployment and monitoring**.

## Key Concepts & Components
- **Discriminative model**: learns P(Y|X) to classify/predict; not suited to sampling new data.
- **Generative model**: learns P(X) or P(X,Y) to sample new instances.
- **Modern generative algorithms**: VAEs, GANs, diffusion models, autoregressive models — pick based on quality/speed/stability trade-offs.
- **Self-supervised learning**: the key data lever; lets models train on unlabeled internet-scale data.
- **Model capacity**: measured by parameter count and FLOP count — they trade off differently (dense vs. sparse).
- **Scaling law**: loss improves predictably (power-law) with model size, data, and compute; DeepMind showed data should scale linearly with model size.
- **Self-attention**: `softmax(QK^T/√d_k)V`; multi-head attention projects into multiple subspaces.
- **Distributed training**: data parallelism (sync vs. async), model parallelism (pipeline PP + tensor TP), hybrid, plus ZeRO/FSDP.
- **Gradient checkpointing / mixed precision (AMP)**: memory/efficiency optimizations for large-model training.

## Trade-offs & Anti-patterns
- **Treating the algorithm as the whole system**: real GenAI systems need data pipelines, evaluation, infra, and monitoring — discuss all of them.
- **Disorganized responses**: skipping requirement clarification hides your reasoning and loses the interviewer.
- **Synthetic-data overuse**: AI-generated training data adds diversity and scale but risks quality drift, bias propagation, and real-world distribution gaps.
- **Single-machine training**: assume large models need gradient checkpointing, AMP, and distributed parallelism.
- **Ignoring non-functional requirements early**: latency/scale shape later tuning even if they don't change the initial architecture.

## Key Takeaways
1. Always run the 7-step framework top-to-bottom; it is the backbone of every chapter that follows.
2. Choose the algorithm by output type (discriminative vs. generative), then task, then trade-offs — never default to one model.
3. Cite data, parameters, and compute as the three drivers of GenAI power, and name scaling laws.

## Connects To
- **01-gmail-smart-compose**: first application of the framework + two-stage training.
- **08-text-to-image-generation**: applies scaling/efficiency mitigations to diffusion models.
- **10-text-to-video-generation**: uses distributed training + latent diffusion to tame compute cost.
