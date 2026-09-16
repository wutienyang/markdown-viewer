# 04: Image Captioning

## Core Idea
Design a multimodal system that generates a short text caption for an image by combining an image encoder (Transformer/ViT) with a text decoder (decoder-only Transformer) in an encoder-decoder framework, evaluated with CIDEr.

## Design Framework / Approach
- **Input/output**: image → descriptive caption text (multimodal generation).
- **Model choice**: treat the image as a "language" and reuse the encoder-decoder framework — an image encoder encodes visual content, a text decoder generates the caption.
- **Image encoder**: prefer a Transformer (ViT-style: patchify + positional encoding + Transformer) over CNN because self-attention captures long-range spatial dependencies for richer captions.
- **Encoder output**: prefer a sequence of tokens (per-patch) over a single vector — preserves local detail and aligns with the attention mechanism.
- **Training**: two-stage — pretrain text decoder on general text (reuse GPT-2/Llama) and image encoder (reuse CLIP/ViT), then finetune both on image–caption pairs with next-token prediction + cross-entropy.
- **Sampling**: beam search for quality, consistency, and coherence.
- **System**: image preprocessing → caption generator (beam search + confidence threshold) → post-processing (bias/offensive filtering).

## Key Concepts & Components
- **Patchify**: split image into fixed patches, flatten, and linearly project into embeddings.
- **Positional encoding**: 1D vs. 2D, learnable vs. fixed — no universal best; test combinations (ViT uses learnable 1D).
- **CNN vs. Transformer encoder**: CNNs capture local patterns but struggle with long-range dependencies.
- **Data cleaning**: remove non-English/duplicate/irrelevant captions (CLIP relevance score threshold ~0.25), summarize long captions with an LLM.
- **Image prep**: remove low-res/low-quality (LAION Aesthetics Predictor), resize + center-crop to preserve aspect ratio.
- **CIDEr**: consensus metric — represent captions with TF-IDF, compute cosine similarity to multiple references, average.
- **Multiple reference captions**: enable robust training and fairer evaluation.

## Trade-offs & Anti-patterns
- **Single-token image encoding**: compresses away local detail — captions become generic; prefer patch sequences.
- **Stochastic sampling**: creative but inconsistent — use beam search for predictable captions.
- **Word-level tokenization**: avoid; use BPE.
- **CIDEr limits**: penalizes novel-yet-accurate captions and lacks semantic understanding (e.g., "coffee on table" vs. "table on coffee").
- **Online metrics**: hard to collect for captioning (embedded in larger systems, subjective judgment) — lean on offline metrics.

## Key Takeaways
1. Reuse the encoder-decoder framework and treat the image as an input language — don't build from scratch.
2. Emit a sequence of image patches (not one vector) so the decoder can attend to regions.
3. Evaluate with CIDEr for consensus-based quality, supplemented by BLEU/ROUGE/METEOR.

## Connects To
- **02-google-translate**: same encoder-decoder idea, different modality.
- **05-retrieval-augmented-generation**: image captioning is one way to align image/text embeddings for retrieval.
- **08-text-to-image-generation**: inverse task — shares CLIP and ViT foundations.
