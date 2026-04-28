// ============================================================
// generative.js — Generative models (GAN / VAE / Diffusion)
// ============================================================
// Less central to surgical workflow recognition, but increasingly
// used for surgical data augmentation, synthetic frame generation,
// and counterfactual reasoning.

export const GEN_PAPERS = [
  {id:"gan", t:"GAN", a:"Goodfellow et al.", v:"NeurIPS 2014", y:2014,
   cat:"Generative", sub:"Adversarial", domain:"general",
   parents:[],
   ax:"1406.2661",
   tg:["minimax","generator vs discriminator"],
   n:"開啟 generative AI 的論文。Generator + Discriminator minimax game。"},

  {id:"vae", t:"VAE", a:"Kingma & Welling", v:"ICLR 2014", y:2014,
   cat:"Generative", sub:"Latent Variable", domain:"general",
   parents:[],
   ax:"1312.6114",
   tg:["reparameterization","ELBO","variational"],
   n:"另一條 generative 主線 — 變分推論 + 重參數化。後續 diffusion 的概念基礎。"},

  {id:"ddpm", t:"DDPM (Diffusion Models)", a:"Ho et al.", v:"NeurIPS 2020", y:2020,
   cat:"Generative", sub:"Diffusion", domain:"general",
   parents:["vae"],
   ax:"2006.11239",
   tg:["denoising","Markov chain","forward/reverse"],
   n:"Denoising Diffusion Probabilistic Models。讓 diffusion 取代 GAN 成為主流 generative 方法。", pri:2},

  {id:"stablediffusion", t:"Stable Diffusion / LDM", a:"Rombach et al.", v:"CVPR 2022", y:2022,
   cat:"Generative", sub:"Diffusion", domain:"general",
   parents:["ddpm","vae"],
   ax:"2112.10752",
   tg:["latent diffusion","CLIP guidance","open-source"],
   n:"在 latent space 做 diffusion 大幅降低運算成本。開源版本引爆 image generation 的應用浪潮。"},
];
