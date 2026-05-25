/**
 * AniMatch — Genre Mixer (genres.js)
 * Uses Jikan API v4 to find anime matching two selected genres.
 */

// ── GENRE LIST WITH JIKAN IDs ──────────────────────────────────────────────
const GENRES = [
  { id: 1,  name: "Action"       },
  { id: 2,  name: "Adventure"    },
  { id: 4,  name: "Comedy"       },
  { id: 8,  name: "Drama"        },
  { id: 10, name: "Fantasy"      },
  { id: 14, name: "Horror"       },
  { id: 7,  name: "Mystery"      },
  { id: 22, name: "Romance"      },
  { id: 24, name: "Sci-Fi"       },
  { id: 36, name: "Slice of Life"},
  { id: 30, name: "Sports"       },
  { id: 37, name: "Supernatural" },
  { id: 41, name: "Suspense"     },
  { id: 18, name: "Mecha"        },
  { id: 38, name: "Military"     },
  { id: 17, name: "Martial Arts" },
  { id: 40, name: "Psychological"},
  { id: 23, name: "School"       },
  { id: 62, name: "Isekai"       },
  { id: 46, name: "Award Winning"},
];

// ── PRESET COMBOS ──────────────────────────────────────────────────────────
const PRESETS = [
  { label: "Battle Scholar",  g1: 1,  g2: 23, note: "Action × School"        },
  { label: "Dark Fantasy",    g1: 10, g2: 40, note: "Fantasy × Psychological" },
  { label: "Love & Laughs",   g1: 22, g2: 4,  note: "Romance × Comedy"       },
  { label: "Space Horror",    g1: 24, g2: 14, note: "Sci-Fi × Horror"        },
  { label: "Martial Mystic",  g1: 17, g2: 37, note: "Martial Arts × Supernatural"},
  { label: "Tragic Slice",    g1: 36, g2: 8,  note: "Slice of Life × Drama"  },
  { label: "Mecha War",       g1: 18, g2: 38, note: "Mecha × Military"       },
  { label: "Isekai Quest",    g1: 62, g2: 2,  note: "Isekai × Adventure"     },
  { label: "Mind Games",      g1: 41, g2: 7,  note: "Suspense × Mystery"     },
  { label: "Sports Spirit",   g1: 30, g2: 8,  note: "Sports × Drama"         },
];

// ── STATE ──────────────────────────────────────────────────────────────────
let selectedG1 = null;   // genre id
let selectedG2 = null;   // genre id
let currentPage = 1;
let totalResults = 0;
let isFetching = false;

// ── INIT ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGenreTags();
  renderPresets();
});

// ── RENDER GENRE TAGS ──────────────────────────────────────────────────────
function renderGenreTags() {
  const g1Wrap = document.getElementById('tags-g1');
  const g2Wrap = document.getElementById('tags-g2');

  GENRES.forEach(g => {
    // Panel 1 tag
    const t1 = document.createElement('span');
    t1.className = 'genre-tag';
    t1.dataset.id = g.id;
    t1.dataset.panel = '1';
    t1.textContent = g.name;
    t1.onclick = () => selectGenre(1, g.id, g.name, t1);
    g1Wrap.appendChild(t1);

    // Panel 2 tag
    const t2 = document.createElement('span');
    t2.className = 'genre-tag';
    t2.dataset.id = g.id;
    t2.dataset.panel = '2';
    t2.textContent = g.name;
    t2.onclick = () => selectGenre(2, g.id, g.name, t2);
    g2Wrap.appendChild(t2);
  });
}

// ── SELECT GENRE ───────────────────────────────────────────────────────────
function selectGenre(panel, id, name, el) {
  if (panel === 1) {
    // deselect old
    document.querySelectorAll('#tags-g1 .genre-tag').forEach(t => t.classList.remove('selected-red'));
    selectedG1 = id;
    el.classList.add('selected-red');
    const disp = document.getElementById('display-g1');
    disp.textContent = name;
    disp.classList.remove('empty');
  } else {
    document.querySelectorAll('#tags-g2 .genre-tag').forEach(t => t.classList.remove('selected-teal'));
    selectedG2 = id;
    el.classList.add('selected-teal');
    const disp = document.getElementById('display-g2');
    disp.textContent = name;
    disp.classList.remove('empty');
  }
  updateMixButton();
}

// ── UPDATE MIX BTN STATE ───────────────────────────────────────────────────
function updateMixButton() {
  const btn = document.getElementById('btn-mix');
  btn.disabled = !(selectedG1 && selectedG2);
}

// ── CLEAR SELECTIONS ───────────────────────────────────────────────────────
function clearSelections() {
  selectedG1 = null;
  selectedG2 = null;

  document.querySelectorAll('.genre-tag').forEach(t => {
    t.classList.remove('selected-red', 'selected-teal');
  });

  const d1 = document.getElementById('display-g1');
  d1.textContent = 'PICK ONE';
  d1.classList.add('empty');

  const d2 = document.getElementById('display-g2');
  d2.textContent = 'PICK ONE';
  d2.classList.add('empty');

  updateMixButton();
  showWelcome();
}

// ── RENDER PRESETS ─────────────────────────────────────────────────────────
function renderPresets() {
  const wrap = document.getElementById('preset-chips');
  PRESETS.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'preset-chip';
    chip.innerHTML = `${p.label}<span class="combo-genres">${p.note}</span>`;
    chip.onclick = () => applyPreset(p);
    wrap.appendChild(chip);
  });
}

function applyPreset(p) {
  // Set genre 1
  const g1 = GENRES.find(g => g.id === p.g1);
  const g2 = GENRES.find(g => g.id === p.g2);
  if (!g1 || !g2) return;

  // Update panel 1
  document.querySelectorAll('#tags-g1 .genre-tag').forEach(t => {
    t.classList.remove('selected-red');
    if (parseInt(t.dataset.id) === p.g1) t.classList.add('selected-red');
  });
  selectedG1 = p.g1;
  const d1 = document.getElementById('display-g1');
  d1.textContent = g1.name;
  d1.classList.remove('empty');

  // Update panel 2
  document.querySelectorAll('#tags-g2 .genre-tag').forEach(t => {
    t.classList.remove('selected-teal');
    if (parseInt(t.dataset.id) === p.g2) t.classList.add('selected-teal');
  });
  selectedG2 = p.g2;
  const d2 = document.getElementById('display-g2');
  d2.textContent = g2.name;
  d2.classList.remove('empty');

  updateMixButton();
  doMix();
}

// ── DO MIX ─────────────────────────────────────────────────────────────────
async function doMix() {
  if (!selectedG1 || !selectedG2 || isFetching) return;

  currentPage = 1;
  document.getElementById('cards-grid').innerHTML = '';
  document.getElementById('results-display').style.display = 'none';
  showLoading();

  await fetchAndRender(true);
}

// ── LOAD MORE ──────────────────────────────────────────────────────────────
async function loadMore() {
  if (isFetching) return;
  currentPage++;
  await fetchAndRender(false);
}

// ── FETCH & RENDER ─────────────────────────────────────────────────────────
async function fetchAndRender(isFirstPage) {
  isFetching = true;
  const btn = document.getElementById('btn-mix');
  btn.disabled = true;

  const g1Name = GENRES.find(g => g.id === selectedG1)?.name || '';
  const g2Name = GENRES.find(g => g.id === selectedG2)?.name || '';

  try {
    const url = `https://api.jikan.moe/v4/anime?genres=${selectedG1},${selectedG2}&order_by=score&sort=desc&limit=20&page=${currentPage}&sfw=true`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const results = data.data || [];
    totalResults = data.pagination?.items?.total || results.length;

    if (isFirstPage && results.length === 0) {
      showEmpty();
      return;
    }

    hideAllStates();
    const grid = document.getElementById('cards-grid');

    results.forEach((anime, i) => {
      const rank = (currentPage - 1) * 20 + i + 1;
      const card = createCard(anime, rank, g1Name, g2Name);
      // stagger animation
      card.style.animationDelay = `${(i % 10) * 40}ms`;
      grid.appendChild(card);
    });

    // Update header info
    if (isFirstPage) {
      document.getElementById('results-count').textContent =
        `${totalResults.toLocaleString()} ANIME`;
      document.getElementById('results-combo-label').innerHTML =
        `<span class="g1">${g1Name.toUpperCase()}</span>` +
        `<span class="sep"> ╳ </span>` +
        `<span class="g2">${g2Name.toUpperCase()}</span>`;
    }

    document.getElementById('results-display').style.display = 'block';

    // Load more button
    const hasNext = data.pagination?.has_next_page;
    const loadBtn = document.getElementById('btn-load-more');
    loadBtn.disabled = !hasNext;

    updateTicker(g1Name, g2Name, totalResults);

  } catch (err) {
    console.error('Fetch error:', err);
    if (isFirstPage) showEmpty();
  } finally {
    isFetching = false;
    updateMixButton(); // re-enable MIX
  }
}

// ── CREATE CARD ────────────────────────────────────────────────────────────
function createCard(anime, rank, g1Name, g2Name) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  card.title = anime.title || '';
  card.onclick = () => {
    const url = anime.url || `https://myanimelist.net/anime/${anime.mal_id}`;
    window.open(url, '_blank');
  };

  // Rank badge
  const rankBadge = document.createElement('div');
  rankBadge.className = 'card-rank';
  rankBadge.textContent = `#${rank}`;
  card.appendChild(rankBadge);

  // Score badge
  if (anime.score) {
    const scoreBadge = document.createElement('div');
    scoreBadge.className = 'card-score';
    scoreBadge.textContent = `★ ${anime.score.toFixed(1)}`;
    card.appendChild(scoreBadge);
  }

  // Poster
  const posterUrl = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
  if (posterUrl) {
    const img = document.createElement('img');
    img.className = 'card-poster';
    img.src = posterUrl;
    img.alt = anime.title;
    img.loading = 'lazy';
    img.onerror = () => {
      img.replaceWith(makePosterPlaceholder(anime.title));
    };
    card.appendChild(img);
  } else {
    card.appendChild(makePosterPlaceholder(anime.title));
  }

  // Info block
  const info = document.createElement('div');
  info.className = 'card-info';

  const title = document.createElement('div');
  title.className = 'card-title';
  title.textContent = anime.title_english || anime.title || 'Unknown';
  info.appendChild(title);

  // Genre tags (highlight the two matched ones)
  const genreWrap = document.createElement('div');
  genreWrap.className = 'card-genres';
  const animeGenres = (anime.genres || []).slice(0, 4);
  animeGenres.forEach(g => {
    const tag = document.createElement('span');
    tag.className = 'card-genre-tag';
    if (g.name.toLowerCase() === g1Name.toLowerCase()) tag.classList.add('match-red');
    if (g.name.toLowerCase() === g2Name.toLowerCase()) tag.classList.add('match-teal');
    tag.textContent = g.name;
    genreWrap.appendChild(tag);
  });
  info.appendChild(genreWrap);

  // Meta row
  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const year = anime.aired?.prop?.from?.year || '—';
  const eps  = anime.episodes ? `${anime.episodes} eps` : anime.type || '—';
  meta.innerHTML = `<span>${year}</span><span>${eps}</span>`;
  info.appendChild(meta);

  card.appendChild(info);
  return card;
}

// ── POSTER PLACEHOLDER ─────────────────────────────────────────────────────
function makePosterPlaceholder(title) {
  const el = document.createElement('div');
  el.className = 'card-poster-placeholder';
  el.textContent = (title || '?')[0].toUpperCase();
  return el;
}

// ── STATE HELPERS ──────────────────────────────────────────────────────────
function showLoading() {
  hideAllStates();
  document.getElementById('loading-state').classList.add('active');
}

function showWelcome() {
  hideAllStates();
  document.getElementById('welcome-state').style.display = '';
}

function showEmpty() {
  hideAllStates();
  document.getElementById('empty-state').classList.add('active');
}

function hideAllStates() {
  document.getElementById('welcome-state').style.display = 'none';
  document.getElementById('loading-state').classList.remove('active');
  document.getElementById('empty-state').classList.remove('active');
}

// ── DYNAMIC TICKER ─────────────────────────────────────────────────────────
function updateTicker(g1, g2, count) {
  const ticker = document.getElementById('ticker-text');
  ticker.textContent =
    ` ★ MIXING ${g1.toUpperCase()} × ${g2.toUpperCase()} ` +
    `★ ${count.toLocaleString()} ANIME FOUND ` +
    `★ RANKED BY SCORE ★ CLICK ANY CARD FOR DETAILS ` +
    `★ ANIMATCH GENRE MIXER ★ `;
}