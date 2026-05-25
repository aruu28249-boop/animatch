// ── STATE ──
let currentYear = 2024;
const MIN_YEAR  = 1990;
const MAX_YEAR  = 2026;

// ── CHANGE YEAR WITH ARROWS ──
function changeYear(direction) {
  const newYear = currentYear + direction;
  if (newYear < MIN_YEAR || newYear > MAX_YEAR) return;
  currentYear = newYear;
  updateYearDisplay();
  fetchYearAnime();
}

// ── JUMP TO SPECIFIC YEAR ──
function jumpYear(year) {
  currentYear = year;
  updateYearDisplay();
  fetchYearAnime();
}

// ── UPDATE DISPLAY ──
function updateYearDisplay() {
  document.getElementById('year-display').textContent = currentYear;
  document.getElementById('year-label').textContent   = currentYear;
}

// ── FETCH ANIME BY YEAR ──
async function fetchYearAnime() {
  const podium   = document.getElementById('podium');
  const yearList = document.getElementById('year-list');

  podium.innerHTML   = '<div class="year-loading">// LOADING...</div>';
  yearList.innerHTML = '';

  try {
    const endDate = currentYear >= 2025
      ? new Date().toISOString().split('T')[0]
      : `${currentYear}-12-31`;

    const res  = await fetch(
      `https://api.jikan.moe/v4/anime?start_date=${currentYear}-01-01&end_date=${endDate}&order_by=score&sort=desc&limit=10&type=tv&min_score=4`
    );
    const data = await res.json();
    const list = data.data;

    if (!list || list.length === 0) {
      podium.innerHTML = '<div class="year-loading">// No results found for this year.</div>';
      return;
    }

    renderPodium(list.slice(0, 3));
    renderList(list.slice(3, 10));

  } catch (err) {
    podium.innerHTML = '<div class="year-loading">// Failed to load. Try again.</div>';
    console.error(err);
  }
}

// ── RENDER PODIUM (TOP 3) ──
function renderPodium(top3) {
  const podium = document.getElementById('podium');
  podium.innerHTML = '';

  // reorder to show 2nd, 1st, 3rd for podium effect
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const ranks  = top3[1] ? [2, 1, 3] : [1, 2, 3];

  order.forEach((anime, i) => {
    const rank = ranks[i];
    const card = document.createElement('div');
    card.className = `podium-card rank-${rank}`;
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="podium-rank">${rank}</div>
      <div class="podium-info">
        <div class="podium-title">${anime.title}</div>
        <div class="podium-score">★ ${anime.score ?? 'N/A'}</div>
        <div class="podium-eps">${anime.episodes ?? '?'} eps</div>
      </div>
    `;
    podium.appendChild(card);
  });
}

// ── RENDER LIST (4–10) ──
function renderList(animeList) {
  const yearList = document.getElementById('year-list');
  yearList.innerHTML = '';

  animeList.forEach((anime, i) => {
    const item = document.createElement('div');
    item.className = 'year-list-item';
    item.innerHTML = `
      <div class="list-rank">${i + 4}</div>
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <div class="list-info">
        <div class="list-title">${anime.title}</div>
        <div class="list-meta">
          <span class="list-score">★ ${anime.score ?? 'N/A'}</span>
          <span>${anime.episodes ?? '?'} eps</span>
          <span>${anime.genres?.slice(0, 2).map(g => g.name).join(' · ') ?? ''}</span>
        </div>
      </div>
    `;
    yearList.appendChild(item);
  });
}

// ── INIT ──
fetchYearAnime();