# 10: Text-to-Video Generation

## Core Idea
Generate a 5-second 720p video from text by extending a diffusion model to the temporal domain, using a latent diffusion model (LDM) with a VAE compression network and a DiT (or temporal-augmented U-Net) to keep compute tractable.

## Design Framework / Approach
- **Input/output**: text prompt → 5s, 24 FPS, 720p video (120 frames) aligned to the prompt.
- **Model choice**: use a diffusion model (as in text-to-image) but switch to a **latent diffusion model (LDM)** — denoise in a compressed latent space, not pixel space — to cut cost.
- **Compression network**: a VAE (visual encoder + decoder) that reduces both temporal and spatial resolution (e.g., 8×8×8 → 512× smaller), trained separately.
- **Architecture**: DiT (patchify 3D patches → positional encoding (RoPE) → Transformer → unpatchify) preferred over U-Net for scalability and flexibility; U-Net needs injected temporal attention + temporal convolution layers for cross-frame consistency.
- **Training**: same diffusion objective (predict noise, MSE) with two data-scarcity strategies — train on both image+video data (treat image as single-frame video) or pretrain on images then finetune on video.
- **Sampling**: denoise latent noise, then visual decoder → pixel space.
- **System**: data pipeline (filter/standardize videos, precompute latents + caption embeddings) → training pipeline → inference pipeline (visual decoder + temporal super-resolution).

## Key Concepts & Components
- **Latent diffusion model (LDM)**: diffusion in latent space; popularized by Stable Diffusion, used by Sora and Movie Gen.
- **Temporal attention**: each feature attends across frames for motion consistency.
- **Temporal convolution**: 3D convolution capturing the temporal dimension.
- **3D patchify**: divide video into spatio-temporal patches (vs. 2D for images).
- **Precomputing latent representations**: cache compressed video latents (~200 TB for 100M videos) to avoid re-encoding during training.
- **Spatial super-resolution**: upscale generated resolution (e.g., 720p → 4K).
- **Temporal super-resolution**: interpolate frames (e.g., 12 → 24 FPS).
- **Re-captioning**: use LLaMa3-Video/LLaVA to generate detailed captions — Sora showed it boosts quality.
- **FVD (Fréchet Video Distance)**: FID extended to video via I3D features; measures temporal consistency.
- **Video–text alignment**: CLIP similarity aggregated across frames.

## Trade-offs & Anti-patterns
- **Pixel-space diffusion for video**: 720p video ≈ 7 minutes/frame scale — use LDM for ~512× efficiency.
- **U-Net without temporal layers**: only captures intra-frame relations, causing temporal inconsistency — add temporal attention/convolution.
- **Scarce video–text data**: augment with image–text data (image as single frame) or pretrain on images first.
- **On-the-fly latent computation**: re-encoding videos each training run is wasteful — precompute and cache latents.
- **FID/IS alone for video**: they ignore temporal coherence — add FVD and video–text alignment.

## Key Takeaways
1. Adopt a latent diffusion model to make video generation computationally feasible.
2. Add temporal layers (attention/convolution) to U-Net, or choose DiT with 3D patches + RoPE for scalability.
3. Precompute latents and caption embeddings, then evaluate with FVD + CLIP similarity + human judgment.

## Connects To
- **08-text-to-image-generation**: diffusion foundation this chapter extends to video.
- **07-high-resolution-image-synthesis**: VAE compression (VQ-VAE) parallels the LDM compression network.
- **06-realistic-face-generation**: the VAE's compression role is foreshadowed here.
