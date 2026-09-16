# 03: ChatGPT Personal Assistant Chatbot

## Core Idea
Build a chatbot by training a decoder-only LLM in three stages — pretraining, supervised finetuning (SFT), and RLHF — and sample with stochastic methods (top-p + temperature) for open-ended, human-like responses.

## Design Framework / Approach
- **Input/output**: text prompt → contextually appropriate text response (language generation).
- **Architecture**: decoder-only Transformer (GPT, Gemini, Llama), but with advanced positional encoding for long context windows.
- **Positional encoding**: absolute → relative → **RoPE** (rotation matrices that encode both absolute and relative position, generalize to unseen lengths).
- **Training (three stages)**:
  1. **Pretraining** on web corpora (Common Crawl, C4, GitHub, Wikipedia, Books, ArXiv, Stack Exchange) with next-token prediction + cross-entropy.
  2. **SFT** on small, high-quality (prompt, response) demonstration data (10k–100k pairs).
  3. **RLHF**: train a reward model on (prompt, winning, losing) preference pairs using margin ranking loss, then optimize the SFT model with PPO/DPO to maximize reward.
- **Sampling**: stochastic — top-k or top-p (nucleus) sampling, tuned with temperature and repetition penalty.
- **System**: training pipeline (3 stages) + inference pipeline (safety filtering → prompt enhancer → response generator → response safety evaluator → rejection response generator → session management).

## Key Concepts & Components
- **RoPE**: encodes position as rotation in embedding space; captures absolute and relative distances.
- **Demonstration data**: SFT data; much smaller but higher quality than pretraining data (expert labelers).
- **Reward model**: copy of SFT model + scalar prediction head; scores (prompt, response) pairs.
- **Preference pairs**: rank responses (not score) to reduce annotator subjectivity; build (winning, losing) pairs.
- **Margin ranking loss**: `max(0, m - (S_win - S_lose))`.
- **Top-k sampling**: sample from the k most likely tokens (fixed count — fragile on sharp/flat distributions).
- **Top-p (nucleus) sampling**: sample from the smallest token set whose cumulative probability exceeds p — adaptive.
- **Temperature**: scales logits before softmax; <1 more deterministic, >1 more diverse.
- **Evaluation benchmarks**: MMLU, GSM8K, HumanEval (task); RealToxicityPrompts, CrowS-Pairs, TruthfulQA (safety).

## Trade-offs & Anti-patterns
- **Deterministic sampling (greedy/beam) for dialogue**: causes repetition and generic responses — use top-p.
- **Multinomial sampling alone**: flat distributions produce incoherent text — rarely used.
- **Fixed top-k**: misses the best token on sharp distributions or limits creativity on flat ones — prefer top-p.
- **Two-stage training for chatbots**: insufficient — SFT alone can produce plausible but unhelpful/unsafe responses; add RLHF.
- **Temperature extremes**: too high = erratic, too low = repetition; tune empirically per task.

## Key Takeaways
1. Use RoPE for long-context LLMs to capture relative position and generalize past training length.
2. Train in three stages — pretraining gives language, SFT gives instruction-following, RLHF gives helpfulness/safety.
3. Evaluate across task-specific benchmarks AND safety benchmarks; human evaluation remains the gold standard.

## Connects To
- **01-gmail-smart-compose**: decoder-only Transformer and next-token prediction foundation.
- **05-retrieval-augmented-generation**: extends this chatbot with external knowledge; shares safety filtering.
- **09-personalized-headshot-generation**: RLHF also appears as a quality-improvement technique for diffusion.
