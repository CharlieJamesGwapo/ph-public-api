const express = require('express');
const router = express.Router();

// Free AI image generation via Pollinations.ai — no key required.
// Returns the image URL (so client can <img src> it directly).
// Optionally proxy if ?proxy=1 is set.

router.get('/', (req, res) => {
  const prompt = (req.query.prompt || req.query.q || '').toString().trim();
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const width = parseInt(req.query.width) || 768;
  const height = parseInt(req.query.height) || 768;
  const seed = req.query.seed || Date.now();

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  res.json({
    prompt,
    width, height, seed: String(seed),
    image_url: url,
    provider: 'pollinations.ai',
    notes: 'Free, no key, ~5-15 second generation time. Direct <img src> works.',
  });
});

module.exports = router;
