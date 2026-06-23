# AniMatch 🎌

![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)
![HTML5](https://img.shields.io/badge/HTML-5-orange?logo=html5)
![CSS3](https://img.shields.io/badge/CSS-3-blue?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)

**AniMatch** is a dark-themed anime discovery platform that helps users find their next watch through mood-based search, genre matching, filler episode analysis, and year-wise rankings — built entirely with vanilla HTML, CSS, and JavaScript, with zero backend dependencies.

**Live demo:** [animatch-hazel.vercel.app](https://animatch-hazel.vercel.app/)

---

## Overview

Most anime discovery tools rely on static genre tags or algorithmic recommendations that don't account for mood, viewing context, or the frustration of filler-heavy long-running series. AniMatch addresses this with four purpose-built tools, all powered by the [Jikan API](https://jikan.moe/) (an unofficial MyAnimeList REST API) and a self-maintained local dataset for filler tracking.

The project was built as a single-page-per-feature static site with no frameworks, no build tooling, and no server — making it lightweight, fast to deploy, and easy to maintain.

---

## Features

### Mood-Based Search
Users can search by descriptive mood or vibe rather than fixed genre categories — natural-language-style queries are mapped to relevant genre combinations and ranked results.

### Filler Checker
Cross-references a locally scraped dataset (sourced from animefillerlist.com) to break down any long-running series into:
- Canon episode count
- Filler episode count
- Filler percentage
- Skip recommendations based on filler density

### Genre Mixer
Allows users to select two genres simultaneously and surfaces anime that satisfy both criteria, using Jikan's genre-intersection query parameters with score-based ranking and pagination.

### Anime of the Day
A deterministic daily pick, pulled from a refreshed Top 25 list and indexed by the current date, ensuring all visitors see a consistent recommendation throughout the day.

### Year-Wise Rankings
Browse top-rated anime by release year (1990–2026), including:
- Podium-style top 3 display
- Full top 10 list with scores, genres, and posters
- Live-airing inclusion for current-year results

---

## Screenshots

| Home Page | Filler Checker | Genre Mixer |
|---|---|---|
| ![Home](assets/homepage.png) | ![Filler Checker](assets/filler-checker.png) | ![Genre Mixer](assets/genre-mixer.png) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (modular architecture, custom properties) |
| Logic | JavaScript (ES6+, Fetch API) |
| Data | [Jikan API v4](https://jikan.moe/) |
| Filler Data | Scraped via Python (`scraper.py`), stored as static JSON |
| Hosting | Vercel |

No frameworks, build steps, or package managers are required to run or modify this project.

---

## Project Structure

```
animatch/
├── index.html              # Homepage — mood search, anime of the day, top 5
├── filler.html              # Filler episode checker
├── yearwise.html             # Year-wise top anime rankings
├── genres.html               # Genre mixer
│
├── css/
│   ├── style.css              # Entry point — imports all modules
│   ├── base.css                # Resets, CSS variables, global typography
│   ├── nav.css                  # Navigation bar
│   ├── home.css                  # Homepage-specific styles
│   ├── filler.css                 # Filler checker styles
│   ├── yearwise.css                # Year-wise page styles
│   ├── genres.css                   # Genre mixer styles
│   └── mobile.css                    # Responsive breakpoints
│
├── js/
│   ├── app.js                # Homepage logic (search, mood mapping, AOTD)
│   ├── filler.js               # Filler checker logic
│   ├── yearwise.js              # Year-wise ranking logic
│   └── genres.js                 # Genre mixer logic
│
├── data/
│   └── fillers.json            # Locally scraped filler-episode dataset
│
├── assets/                       # Images, screenshots, logo
├── scraper.py                      # One-time scraper for filler.json
└── README.md
```

---

## Getting Started

This is a static site with no build process. To run it locally:

```bash
git clone https://github.com/aruu28249-boop/animatch.git
cd animatch
```

Then simply open `index.html` in your browser, or serve it with any static file server:

```bash
npx serve .
```

No `npm install`, no environment variables, no API keys required.

---

## Data Sources

| Data | Source | Method |
|---|---|---|
| Anime metadata, scores, genres, posters | [Jikan API v4](https://jikan.moe/) | Live REST calls (no key required) |
| Filler episode breakdown | [animefillerlist.com](https://www.animefillerlist.com/) | One-time scrape via `scraper.py`, cached in `data/fillers.json` |

> **Note:** Jikan API is rate-limited to 60 requests/minute and 3 requests/second. This is sufficient for standard usage but should be considered if scaling traffic significantly.

---

## Deployment

AniMatch is deployed on **Vercel** with zero configuration — being a static site, any push to the connected GitHub branch triggers an automatic redeploy.

To deploy your own instance:
1. Fork this repository
2. Import it into [Vercel](https://vercel.com/new)
3. Deploy with default settings (no build command needed)

---

## Roadmap

- [ ] AI-assisted recommendation engine
- [ ] Improved mood-to-genre matching accuracy
- [ ] Trailer integration
- [ ] User profiles and watch history
- [ ] "Hidden gems" discovery mode
- [ ] Explainable recommendations (why a result was suggested)
- [ ] Voice-based search input

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

For bugs or ideas, please open an issue describing the problem or suggestion in detail.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

If you find this project useful, consider giving it a ⭐ on GitHub — it helps others discover it too.