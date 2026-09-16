# 08: Text-to-Image Generation

## Core Idea
Generate an image from a text prompt using a diffusion model (U-Net or DiT) that learns to reverse a noising process, guided by the prompt via cross-attention, and accelerated with classifier-free guidance (CFG) and DDIM.

## Design Framework / Approach
- **Input/output**: text prompt (≤128 words) → detailed image (1024×1024).
- **Model choice**: prefer **diffusion** over autoregressive for image quality and sampling flexibility, despite simpler autoregressive implementation.
- **Architecture**: U-Net (downsampling/upsampling blocks with cross-attention to text embeddings) or DiT (patchify → positional encoding → Transformer → unpatchify).
- **Text conditioning**: text encoder (CLIP or T5) embeds the prompt; cross-attention uses image-derived queries + text-derived keys/values.
- **Training**: forward process (add noise per a noise schedule, no ML) + backward process (model predicts noise ε); minimize MSE between true and predicted noise.
- **Sampling**: start from Gaussian noise, iteratively denoise; use CFG (increase prompt influence) and DDIM (fewer steps).
- **System pipelines**: data, training, evaluation, model optimization (compression/distillation), inference (prompt auto-complete → safety → enhancement → generation → harm detection → super-resolution).

## Key Concepts & Components
- **Forward vs. backward process**: noising vs. denoising.
- **Noise schedule**: variance parameters β_t control per-step noise (small early, large late); reparameterize to sample x_t directly from x_0.
- **Conditioning signals**: caption embedding + timestep t.
- **CFG (classifier-free guidance)**: blend conditioned and unconditioned predictions during sampling to improve prompt alignment.
- **DDIM**: reduce diffusion steps from ~1000 to ~20 while preserving quality.
- **Latent diffusion**: operate in a lower-dimensional latent space to cut compute (detailed in later chapters).
- **CLIPScore**: cosine similarity of CLIP text and image embeddings for image–text alignment.
- **DrawBench**: curated prompt benchmark for evaluating composition/context.
- **Training mitigations**: mixed precision, model/data parallelism (FSDP, DeepSpeed), latent diffusion.
- **Cascade super-resolution**: base model at low res → successive super-resolution models to 1024×1024.

## Trade-offs & Anti-patterns
- **Autoregressive for peak quality**: simpler and statistically efficient, but diffusion produces better detail and can trade steps for speed.
- **Slow diffusion sampling**: mitigate with DDIM, parallel sampling, distillation, quantization.
- **Training in pixel space at scale**: memory-bound — use mixed precision, parallelism, and latent diffusion.
- **Poor prompt alignment**: base sampling drifts from the prompt — add CFG.
- **Safety gaps**: always add prompt safety + harm detection + super-resolution in the inference pipeline.

## Key Takeaways
1. Choose diffusion when image quality and sampling flexibility dominate; autoregressive when implementation simplicity matters.
2. Train by predicting noise (MSE), not the clean image — simpler and more effective.
3. Wrap the model in data, training, optimization, and safety pipelines; use cascaded super-resolution for high-res output.

## Connects To
- **07-high-resolution-image-synthesis**: the autoregressive alternative to this chapter.
- **09-personalized-headshot-generation**: finetunes this diffusion model per subject.
- **10-text-to-video-generation**: extends diffusion to video via latent diffusion + temporal layers.
