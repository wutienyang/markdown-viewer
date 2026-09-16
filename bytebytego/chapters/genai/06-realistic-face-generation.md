# 06: Realistic Face Generation

## Core Idea
Generate realistic faces from noise by choosing a GAN for its fast generation and latent-space attribute control, trained adversarially (generator vs. discriminator) and evaluated with Inception score and FID.

## Design Framework / Approach
- **Input/output**: random noise (or optional attributes) → realistic face image.
- **Model choice**: compare VAE (fast/stable but blurry), GAN (high quality + attribute control, unstable), autoregressive (detailed but slow), diffusion (best quality but slow). Pick **GAN** for facial attribute manipulation via structured latent space.
- **Generator**: stack of upsampling blocks (transposed convolution → normalization → non-linear activation; final block uses Tanh to match [-1,1] pixels).
- **Discriminator**: downsampling blocks (Conv2D stride-2, BatchNorm, ReLU) + classification head (fully-connected + sigmoid).
- **Training**: adversarial training — alternate freezing generator/discriminator; minimax loss (discriminator maximizes, generator minimizes); use binary cross-entropy.
- **Sampling**: random sampling (diversity) vs. truncated sampling (high-probability region for realism).
- **System**: face generator (StyleGAN for attribute control) + training/evaluation/deployment services.

## Key Concepts & Components
- **Latent space**: multidimensional space of noise vectors; each point maps to a face.
- **Transposed convolution** (deconvolution): increases spatial resolution by inserting zeros and convolving.
- **Normalization types**: batch (BN), layer (LN), instance (IN — style transfer/image gen), group (GN — small batches).
- **Minimax loss**: unifies generator + discriminator objectives; `min_G max_D`.
- **Vanishing gradients**: over-strong discriminator starves the generator — mitigate with modified minimax or Wasserstein loss.
- **Mode collapse**: generator produces limited variety — mitigate with Wasserstein loss or Unrolled GAN.
- **Failure to converge**: discriminator feedback degrades past ~50% accuracy — mitigate with normalization, differing LR, regularization, noise injection.
- **WGAN critic**: outputs a "realness" score, not a probability; critic loss = `D(x) - D(G(z))`.
- **Inception score / FID**: measure quality+diversity; FID compares feature distributions (lower = better).

## Trade-offs & Anti-patterns
- **VAE for realism**: produces blurry images lacking high-frequency detail — avoid for face generation (use for compression).
- **Training GANs naively**: mode collapse and non-convergence are common — discuss mitigations explicitly.
- **Autoregressive/diffusion for face attribute control**: they lack a structured latent space for easy manipulation.
- **Automated metrics alone**: Inception score/FID don't fully align with human judgment — add human evaluation.
- **Biased data**: ensure diverse, balanced training faces (tag with classifiers) to avoid biased outputs.

## Key Takeaways
1. Match the generative family to requirements: GAN for speed + latent control, diffusion for peak quality, VAE for compression.
2. Prepare for GAN training instability with Wasserstein loss, normalization, and balanced generator/discriminator updates.
3. Evaluate with Inception score (diversity+quality) and FID (distribution distance), plus human pairwise comparison.

## Connects To
- **07-high-resolution-image-synthesis**: GAN adversarial loss is reused in VQ-VAE's tokenizer training.
- **08-text-to-image-generation**: diffusion models, which here lose to GANs for faces, win for text-to-image quality.
- **10-text-to-video-generation**: VAE's compression capability is exploited in latent diffusion.
