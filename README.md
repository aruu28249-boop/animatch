# AniMatch 🎌

A chaotic dark-themed anime discovery website. No backend, no API key — just vibes and Jikan.

## Pages

| Page | What it does |
|------|-------------|
| **Home** | Mood-based search, free text search, Anime of the Day, Top 5 |
| **Year Wise** | Browse top anime by year (1990–2026) with podium + full list |
| **Filler Checker** | Check any anime's filler episodes, stats, and skip advice |
| **Genre Mixer** | Pick 2 genres, get anime matching both |

## Stack

- Pure HTML + CSS + JS — zero frameworks
- [Jikan API v4](https://jikan.moe) — free MyAnimeList wrapper, no key needed
- Scraped filler data from animefillerlist.com (one-time, stored in `data/fillers.json`)

## Run Locally

Just open `index.html` in a browser. No install, no build step.

## Deploy

Works on Vercel, Netlify, or GitHub Pages out of the box.
