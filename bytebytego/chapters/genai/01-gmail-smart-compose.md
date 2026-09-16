# 01: Gmail Smart Compose

## Core Idea
Design an email-completion feature by framing it as next-token prediction on a decoder-only Transformer, trained with a two-stage (pretrain + finetune) strategy and sampled deterministically with beam search.

## Design Framework / Approach
- **Input/output**: sequence of typed words → continuation of that sequence (text generation task).
- **Model choice**: prefer a Transformer over an RNN for parallelism and long-range dependency handling; within Transformers, pick the **decoder-only** variant because Smart Compose generates text (encoder-only is for understanding, encoder-decoder for sequence transformation).
- **Training**: two-stage — pretrain on general text (Common Crawl), finetune on ~1B emails using next-token prediction + cross-entropy loss.
- **Sampling**: deterministic beam search (consistency preferred over diversity for email).
- **System**: triggering service → phrase generator (beam search + filter long/low-confidence suggestions) → post-processing (bias/NSFW filtering).

## Key Concepts & Components
- **Tokenization levels**: character (small vocab, poor semantics), word (huge vocab), subword (BPE/SentencePiece — balanced; GPT-4 uses BPE, Gemini uses SentencePiece).
- **Token indexing**: map tokens to integer IDs via a learned vocabulary.
- **Text embedding**: dense learned vectors that solve sparsity and capture semantics.
- **Positional encoding**: needed because self-attention is permutation-invariant; fixed sine-cosine (efficient, generalizes) vs. learned (task-optimal but overfits length).
- **Decoder-only Transformer**: text embedding + positional encoding + stack of (multi-head self-attention, feed-forward) blocks + prediction head.
- **Two-stage training**: pretraining = regularization + transfer learning; finetuning is fast and mitigates overfitting.
- **Prompt template**: combine subject/recipient/body into one tagged sequence (GenAI decouples architecture from input structure).
- **Beam search**: track top-k sequences by cumulative probability; beam width k is configurable.

## Trade-offs & Anti-patterns
- **Training from scratch on task data**: overfits and is expensive — always pretrain first.
- **Stochastic sampling for email**: risks inconsistent/inappropriate suggestions — prefer deterministic.
- **Greedy search**: produces repetitive text; rarely used in practice.
- **Beam search limits**: low diversity and struggles with long sequences — fine for short suggestions, bad for open-ended dialogue.
- **Ignoring context beyond the body**: including subject/recipient/prior emails dramatically improves next-token relevance.

## Key Takeaways
1. Match the Transformer variant to the task: generation → decoder-only, understanding → encoder-only, transformation → encoder-decoder.
2. Use subword tokenization (BPE) to balance vocabulary size and unseen-word handling.
3. Pair next-token prediction with cross-entropy loss in both pretraining and finetuning; only the data changes.

## Connects To
- **00-introduction-and-overview**: first full application of the 7-step framework.
- **02-google-translate**: same two-stage training, but encoder-decoder + MLM objective.
- **03-chatgpt-personal-assistant-chatbot**: extends this to three-stage training and stochastic sampling.
