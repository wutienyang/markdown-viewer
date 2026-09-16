# 09: Personalized Headshot Generation

## Core Idea
Personalize a pretrained text-to-image diffusion model to a specific person by finetuning with DreamBooth (rare-token identifier + class-specific prior preservation loss), chosen over textual inversion and LoRA for identity fidelity.

## Design Framework / Approach
- **Input/output**: 10–20 user face images → 50 professional headshots (1024×1024) preserving identity.
- **Approach selection**: tuning-based (finetune per identity) vs. tuning-free (train a visual encoder once, inject features — e.g., Meta's Imagine Yourself). Prefer tuning-based for detail capture and subject versatility.
- **Personalization methods**:
  - **Textual inversion**: learn one new token embedding; efficient but struggles with detail.
  - **DreamBooth**: finetune all diffusion parameters; most effective but costly to train/store.
  - **LoRA**: inject low-rank ΔW = A·B, freeze original weights; balanced efficiency/effectiveness.
- **Choice**: use **DreamBooth** because identity preservation matters most, ~15 min finetuning fits the <1hr budget, and we discard models afterward (no storage concern).
- **Training**: same diffusion process as before, but with two losses — reconstruction loss (identity) + class-specific prior preservation loss (avoid overfitting to the identity).
- **Sampling**: hand-engineered prompts with the rare-token identifier + CFG; one image per prompt.
- **System**: data pipeline (validate user images + generate generic faces) → training pipeline (finetune) → inference pipeline (image generator → quality assessment → uploader).

## Key Concepts & Components
- **Rare-token identifier**: choose infrequent tokens (e.g., "[V]") to represent the subject — avoids strong prior associations (common words) and character fragmentation (random strings).
- **Class-specific prior preservation loss**: keeps the model able to generate generic faces (anti-overfitting).
- **LoRA math**: `ΔW = A·B` with rank r ≪ dims; only r·(d_in + d_out) params vs. d_in·d_out.
- **Reconstruction loss**: matches generated images to the subject's real images.
- **Image alignment metrics**: CLIP score (image-image via image encoder), DINO score (fine visual features), facial similarity (face recognition model).
- **DINO vs. CLIP**: DINO for image-to-image similarity (captures detail), CLIP for image-to-text.
- **Quality assessment service**: reject headshots that fail identity checks, regenerate with new noise.

## Trade-offs & Anti-patterns
- **Textual inversion alone**: under-captures identity (single token) — use DreamBooth/LoRA for fidelity.
- **Full DreamBooth storage**: gigabytes per subject — LoRA (a few MB) wins when models must be persisted.
- **Overfitting to one identity**: finetuning all params risks losing general face diversity — add prior preservation loss and generic face data.
- **Tuning-free methods**: simpler but rely on a single reference image and need subject-specific adjustments.
- **CLIP/DINO for identity**: high similarity doesn't guarantee same person — always add a face-recognition score.

## Key Takeaways
1. Start from a pretrained T2I model; pick DreamBooth for fidelity, LoRA for storage efficiency, textual inversion for minimal footprint.
2. Represent the subject with a rare-token identifier and regularize with class-specific prior preservation loss.
3. Evaluate on text alignment (CLIPScore), image quality (FID/IS), and identity (facial similarity score).

## Connects To
- **08-text-to-image-generation**: the base diffusion model being personalized.
- **05-retrieval-augmented-generation**: LoRA is introduced there as an efficient finetuning technique.
- **06-realistic-face-generation**: shares face generation and evaluation metrics.
