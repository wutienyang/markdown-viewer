# 07: High-Resolution Image Synthesis

## Core Idea
Generate high-resolution images (1024/2048 px) in seconds by treating images as a sequence of discrete tokens — a VQ-VAE image tokenizer compresses/decodes, while a decoder-only Transformer generates tokens chunk-by-chunk (autoregressive modeling).

## Design Framework / Approach
- **Input/output**: request (no conditioning) → high-resolution image.
- **Model choice**: prefer autoregressive (Transformer) over diffusion for speed at high resolution — chunk-based generation is O(N²)-friendly vs. diffusion's O(T·N²) multi-step cost; VAEs/GANs suffer posterior collapse at high resolution.
- **Two components**:
  - **Image tokenizer (VQ-VAE)**: encode image → discrete tokens; decode tokens → image.
  - **Image generator (decoder-only Transformer)**: generate token sequence autoregressively.
- **Training (two stages)**:
  1. Train the tokenizer (encoder → quantizer → decoder) to reconstruct images.
  2. Train the generator with next-token prediction + cross-entropy on tokenized images.
- **Sampling**: seed with a random token, autoregressively predict tokens (top-p), then decode.
- **System**: generation service (Transformer) + decoding service (tokenizer decoder) + super-resolution service (2x upscale for 2048px).

## Key Concepts & Components
- **VQ-VAE (Vector-Quantized VAE)**: encoder (deep CNN) + quantizer (codebook) + decoder (transposed convs).
- **Quantizer**: maps continuous latents to nearest codebook token via Euclidean distance; an embedding table whose sole parameter is the codebook.
- **Why quantize**: avoids posterior collapse and reduces the learning space (discrete tokens are easier to predict sequentially).
- **Posterior collapse**: powerful decoder ignores latent variables — quantization forces their use.
- **Codebook**: learned embeddings, each an integer token 1..k.
- **Straight-through gradient**: copy decoder-input gradient to encoder output (quantizer lookup has no gradient).
- **Losses**: reconstruction (MSE) + quantization (stop-gradient) + perceptual (VGG features) + adversarial (patch-based, for high-res realism).
- **Chunk generation**: generate 64×64-pixel tokens — a 1024×1024 image needs only 256 tokens.

## Trade-offs & Anti-patterns
- **Pixel-by-pixel autoregression**: O(N²) and slow — generate chunk-by-chunk instead.
- **VAE/GAN at high resolution**: posterior collapse reduces diversity — prefer autoregressive or diffusion.
- **Reconstruction + quantization loss alone**: leaves artifacts at high resolution — add perceptual and adversarial losses.
- **Standard diffusion for high-res**: multi-step sampling takes minutes — autoregressive is faster; (latent diffusion is the alternative in later chapters).
- **Deploying tokenizer encoder in production**: only the decoder is needed at inference.

## Key Takeaways
1. Split image generation into tokenization (VQ-VAE) and sequence generation (decoder-only Transformer).
2. Train the tokenizer with reconstruction + quantization + perceptual + adversarial losses for high-res fidelity.
3. Generate chunk tokens, not pixels, to keep autoregressive generation fast.

## Connects To
- **06-realistic-face-generation**: compares VAE/GAN/diffusion; adversarial loss is reused here.
- **08-text-to-image-generation**: the diffusion alternative; both use decoder-only Transformers and CLIP.
- **10-text-to-video-generation**: VQ-VAE-style compression reappears in latent diffusion models.
