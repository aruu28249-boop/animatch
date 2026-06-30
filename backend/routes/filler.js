// routes/filler.js
// GET /api/filler-check?anime=One Piece
// Calls Groq's LLaMA model to get filler episode data for any anime.
// The GROQ_API_KEY never leaves this server — the frontend only ever
// talks to this backend, never to Groq directly.

import express from 'express';

const router = express.Router();

router.get('/filler-check', async (req, res) => {
  const { anime } = req.query;

  if (!anime || anime.trim() === '') {
    return res.status(400).json({ error: 'Missing "anime" query parameter' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server misconfigured — missing API key' });
  }

  const prompt = `
You are an anime filler-episode expert. For the anime "${anime}", return ONLY a JSON object
(no markdown, no explanation, no code fences) in EXACTLY this format:

{
  "title": "Official anime title",
  "totalEpisodes": number,
  "fillerEpisodes": number,
  "canonEpisodes": number,
  "fillerPercent": number,
  "fillerRanges": ["EP 26", "EP 97-220"],
  "mixedRanges": ["EP 145 (mixed canon/filler)"],
  "advice": "One short sentence of skip advice based on filler percentage"
}

Rules:
- If you don't have reliable filler data for this anime, set fillerEpisodes to 0 and totalEpisodes to your best known episode count.
- fillerPercent must be a rounded number (no decimals).
- Keep "advice" under 20 words.
- IMPORTANT: fillerRanges must contain AT MOST 12 entries. Group consecutive filler episodes into ranges (e.g. "EP 54-61") instead of listing every single small range individually. If there are more than 12 distinct filler stretches, merge nearby ones together so the total stays under 12 entries.
- mixedRanges must contain AT MOST 5 entries, same grouping rule.
- Return ONLY the JSON object. No other text. Do not truncate — the JSON must be complete and valid.
`.trim();

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('Groq API error:', errText);
      return res.status(502).json({ error: 'AI service error' });
    }

    const data = await groqResponse.json();
    const rawText = data.choices?.[0]?.message?.content || '';

    // Strip markdown code fences in case the model adds them anyway
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', cleaned);
      return res.status(502).json({ error: 'AI returned invalid data' });
    }

    if (typeof parsed.totalEpisodes !== 'number') {
      return res.status(502).json({ error: 'AI response missing required fields' });
    }

    return res.status(200).json({ source: 'ai', data: parsed });

  } catch (err) {
    console.error('Filler check error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;