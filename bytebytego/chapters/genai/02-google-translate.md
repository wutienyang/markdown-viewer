# 02: Google Translate

## Core Idea
Build a language-translation service as a sequence-to-sequence task using an encoder-decoder Transformer, pretrained with masked language modeling (MLM) and finetuned with next-token prediction on parallel corpora.

## Design Framework / Approach
- **Input/output**: source-language sequence + target language → translated sequence (seq2seq).
- **Model choice**: prefer encoder-decoder over decoder-only for translation because it separates input understanding from generation, supports bidirectional encoding, handles variable lengths, and uses cross-attention to align output to input.
- **Tokenization**: use subword-level BPE (not word-level) to avoid huge vocabularies and out-of-vocabulary words across languages.
- **Training**: two-stage — unsupervised pretraining with MLM (avoid next-token prediction, which "cheats" by encoding the whole sentence), then supervised finetuning with next-token prediction + cross-entropy.
- **Finetuning strategy**: choose bilingual (one model per language pair, higher accuracy) over multilingual (simpler, cheaper) when accuracy is prioritized.
- **Sampling**: beam search for accuracy and consistency.
- **System**: language detector (encoder-only classifier via average pooling or last-token representation) + translation service.

## Key Concepts & Components
- **BPE (Byte-Pair Encoding)**: starts from characters, iteratively merges the most frequent adjacent pairs into subwords; `</w>` end-token disambiguates word boundaries.
- **Encoder**: text embedding + positional encoding + Transformer with bidirectional self-attention.
- **Decoder**: adds masked self-attention (causal), cross-attention over encoder output, and a prediction head.
- **Cross-attention**: queries from decoder, keys/values from encoder output — integrates source information during generation.
- **MLM**: mask some tokens, train the model to predict them; engages both encoder and decoder without cheating.
- **Named-entity handling**: replace entities with placeholder tokens before translation, restore after.
- **Preprocessing that is now obsolete**: lowercasing, stop-word removal, stemming/lemmatization, punctuation removal — modern Transformers learn these.
- **BLEU / ROUGE / METEOR**: precision-based, recall-based, and synonym-aware translation metrics.

## Trade-offs & Anti-patterns
- **Word-level tokenization for multilingual**: explodes vocabulary size — use BPE/SentencePiece.
- **Next-token prediction during encoder-decoder pretraining**: lets the decoder "cheat" — use MLM instead.
- **Pretraining from scratch**: expensive; reuse T5 or BART.
- **BLEU penalizes valid paraphrases**; METEOR correlates better with humans but is computationally costly and resource-dependent.
- **Stochastic sampling for translation**: diversity is undesirable — prefer beam search.

## Key Takeaways
1. Treat translation as seq2seq and select encoder-decoder for its separation of understanding and generation.
2. Use MLM for unsupervised pretraining of the encoder-decoder, then next-token prediction for finetuning.
3. Evaluate with BLEU (precision), ROUGE (recall), and METEOR (semantic) together; monitor user feedback online.

## Connects To
- **01-gmail-smart-compose**: shares two-stage training and BPE, but swaps decoder-only for encoder-decoder.
- **04-image-captioning**: reuses the encoder-decoder framework with an image as a "language".
- **05-retrieval-augmented-generation**: encoder-only Transformers reappear as the text encoder for embeddings.
