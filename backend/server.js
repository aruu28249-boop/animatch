// server.js
// AniMatch Backend — Express server
// Single responsibility: securely proxy AI-powered filler-episode lookups via Groq.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fillerRoutes from './routes/filler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ──
app.use(cors());
app.use(express.json());

// ── HEALTH CHECK ──
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AniMatch Backend',
    message: 'Server is running. See /api/filler-check?anime=NAME',
  });
});

// ── ROUTES ──
app.use('/api', fillerRoutes);

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AniMatch backend running on port ${PORT}`);
});