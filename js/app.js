// ── MOOD TO GENRE MAPPING ──
const moodMap = {
  hype:      { genres: [1, 17], label: "HYPE MODE" },
  mindgames: { genres: [7, 37], label: "MIND GAMES" },
  dark:      { genres: [7, 14], label: "DARK MODE" },
  romantic:  { genres: [22],    label: "ROMANTIC" },
  happy:     { genres: [4, 36], label: "HAPPY VIBES" },
  chill:     { genres: [36, 22],label: "CHILL MODE" },
  motivated: { genres: [29, 1], label: "MOTIVATED" },
  sad:       { genres: [8, 22], label: "SAD HOURS" },
};

// keyword to mood mapping for search
const keywordMap = {
  dark:          "dark",
  psychological: "mindgames",
  thriller:      "mindgames",
  mind:          "mindgames",
  games:         "mindgames",
  action:        "hype",
  fight:         "hype",
  hype:          "hype",
  battle:        "hype",
  romance:       "romantic",
  romantic:      "romantic",
  love:          "romantic",
  sad:           "sad",
  cry:           "sad",
  emotional:     "sad",
  happy:         "happy",
  funny:         "happy",
  comedy:        "happy",
  chill:         "chill",
  slice:         "chill",
  motivat:       "motivated",
  sport:         "motivated",
};

// ── ANIME OF THE DAY ──
async function loadAnimeOfTheDay() {
  try {
    const res  = await fetch('https://api.jikan.moe/v4/top/anime?limit=25');
    const data = await res.json();
    const list = data.data;

    // pick one based on today's date so it changes daily
    const index = new Date().getDate() % list.length;
    const anime = list[index];

    document.getElementById('aotd-img').src = anime.images.jpg.image_url;
    document.getElementById('aotd-img').alt = anime.title;
    document.getElementById('aotd-score').textContent = anime.score ?? '--';
    document.getElementById('aotd-name').textContent  = anime.title;

    const tagsEl = document.getElementById('aotd-tags');
    tagsEl.innerHTML = '';
    anime.genres.slice(0, 3).forEach(g => {
      const span = document.createElement('span');
      span.className   = 'tag';
      span.textContent = g.name;
      tagsEl.appendChild(span);
    });

  } catch (err) {
    console.error('AOTD error:', err);
  }
}

// ── SELECT MOOD ──
function selectMood(btn) {
  // remove active from all
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const mood = btn.dataset.mood;
  fetchByMood(mood);
}

// ── FETCH BY MOOD ──
async function fetchByMood(mood) {
  const { genres, label } = moodMap[mood];
  document.getElementById('active-mood-label').textContent = label;

  const grid = document.getElementById('results-grid');
  grid.innerHTML = '<div class="loading">// LOADING...</div>';

  try {
    const genreParam = genres.join(',');
    const res  = await fetch(`https://api.jikan.moe/v4/top/anime?genres=${genreParam}&limit=5`);
    const data = await res.json();
    renderCards(data.data);
  } catch (err) {
    grid.innerHTML = '<div class="loading">// FAILED TO LOAD. TRY AGAIN.</div>';
    console.error(err);
  }
}

// ── HANDLE SEARCH ──
function handleSearch() {
  const input = document.getElementById('search-input').value.toLowerCase().trim();

  if (!input) return;

  // keyword matching
  let matchedMood = null;
  for (const [keyword, mood] of Object.entries(keywordMap)) {
    if (input.includes(keyword)) {
      matchedMood = mood;
      break;
    }
  }

  if (matchedMood) {
    // highlight matched mood button
    document.querySelectorAll('.mood-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mood === matchedMood);
    });
    fetchByMood(matchedMood);
  } else {
    // fallback — search by title directly
    fetchByTitle(input);
  }
}

// ── FETCH BY TITLE (fallback) ──
async function fetchByTitle(query) {
  document.getElementById('active-mood-label').textContent = 'SEARCH RESULTS';

  const grid = document.getElementById('results-grid');
  grid.innerHTML = '<div class="loading">// SEARCHING...</div>';

  try {
    const res  = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5&order_by=score&sort=desc`);
    const data = await res.json();
    renderCards(data.data);
  } catch (err) {
    grid.innerHTML = '<div class="loading">// SEARCH FAILED.</div>';
    console.error(err);
  }
}

// ── RENDER CARDS ──
function renderCards(animeList) {
  const grid = document.getElementById('results-grid');
  grid.innerHTML = '';

  if (!animeList || animeList.length === 0) {
    grid.innerHTML = '<div class="loading">// NO RESULTS FOUND.</div>';
    return;
  }

  animeList.forEach((anime, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="card-rank">${String(i + 1).padStart(2, '0')}</div>
      <div class="card-info">
        <div class="card-name">${anime.title}</div>
        <div class="card-score">★ ${anime.score ?? 'N/A'}</div>
        <div class="card-ep">${anime.episodes ?? '?'} eps</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// also trigger search on Enter key
document.getElementById('search-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') handleSearch();
});

// ── INIT ──
loadAnimeOfTheDay();