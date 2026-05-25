// ── LOAD FILLER DATA ──
let fillerDB = {};

async function loadFillerDB() {
  try {
    const res  = await fetch('data/fillers.json');
    fillerDB   = await res.json();
    console.log('✅ Filler DB loaded:', Object.keys(fillerDB).length, 'anime');
    buildTicker();
  } catch (err) {
    console.error('Failed to load filler DB:', err);
  }
}

// ── BUILD TICKER FROM REAL DATA ──
function buildTicker() {
  const ticker = document.getElementById('filler-ticker');
  if (!ticker) return;

  const items = Object.values(fillerDB)
    .filter(a => a.fillerPct > 0)
    .sort((a, b) => b.fillerPct - a.fillerPct);

  let html = '';
  items.forEach(anime => {
    const emoji = anime.fillerPct >=40 ? '💀' : anime.fillerPct >= 20 ? '⚠️' : '✅';
    html += `<span>● ${anime.title} has ${anime.fillerPct}% filler ${emoji}</span>`;
  });

  // duplicate for seamless loop
  html += html;
  ticker.innerHTML = html;
}

// ── QUICK SEARCH ──
function quickSearch(name) {
  document.getElementById('filler-input').value = name;
  checkFiller();
}

// ── MAIN FUNCTION ──
function checkFiller() {
  const raw  = document.getElementById('filler-input').value.trim();
  if (!raw) return;

  const slug = raw.toLowerCase().replace(/\s+/g, '-');

  let matchKey  = null;
  let matchData = null;

  // exact slug match first
  if (fillerDB[slug]) {
    matchKey  = slug;
    matchData = fillerDB[slug];
  } else {
    // partial title match
    for (const [key, data] of Object.entries(fillerDB)) {
      if (
        key.includes(slug) ||
        slug.includes(key) ||
        data.title.toLowerCase().includes(raw.toLowerCase())
      ) {
        matchKey  = key;
        matchData = data;
        break;
      }
    }
  }

  // show results section
  document.getElementById('filler-results').style.display = 'block';

  if (!matchData) {
    document.getElementById('filler-title').textContent  = raw.toUpperCase();
    document.getElementById('filler-meta').textContent   = 'Not found in database';
    document.getElementById('stat-total').textContent    = '--';
    document.getElementById('stat-filler').textContent   = '--';
    document.getElementById('stat-canon').textContent    = '--';
    document.getElementById('stat-percent').textContent  = '--%';
    document.getElementById('filler-eps-wrap').innerHTML = `
      <p style="font-family:Space Mono,monospace;font-size:12px;color:#ff003c;padding:16px 0;">
        // "${raw}" not found.<br><br>
        Try: naruto, naruto-shippuden, bleach, one-piece,<br>
        dragon-ball-z, boruto, fairy-tail, sword-art-online,<br>
        hunter-x-hunter-2011, my-hero-academia, black-clover
      </p>`;
    document.getElementById('canon-advice').textContent = '';
    document.getElementById('filler-poster').src        = '';
    return;
  }

  showFillerResults(matchData);
  fetchAnimePoster(matchData.title);
}

// ── SHOW RESULTS ──
function showFillerResults(data) {
  const fillerPct = data.fillerPct ?? 0;

  document.getElementById('filler-title').textContent  = data.title.toUpperCase();
  document.getElementById('filler-meta').textContent   = `${data.total} episodes total`;
  document.getElementById('stat-total').textContent    = data.total;
  document.getElementById('stat-filler').textContent   = data.fillerCount;
  document.getElementById('stat-canon').textContent    = data.canonEps?.length ?? (data.total - data.fillerCount);
  document.getElementById('stat-percent').textContent  = fillerPct + '%';

  // render filler episode chips
  const wrap = document.getElementById('filler-eps-wrap');
  wrap.innerHTML = '';

  if (!data.fillerEps || data.fillerEps.length === 0) {
    wrap.innerHTML = '<p style="font-family:Space Mono,monospace;font-size:12px;color:#00f5d4;padding:16px 0;">✓ No fillers! Every episode is canon 🔥</p>';
  } else {
    const ranges = groupRanges(data.fillerEps);
    ranges.forEach(r => {
      const chip       = document.createElement('span');
      chip.className   = r.includes('–') ? 'ep-range' : 'ep-chip';
      chip.textContent = 'EP ' + r;
      wrap.appendChild(chip);
    });
  }

  // mixed episodes
  if (data.mixedEps && data.mixedEps.length > 0) {
    const mixedTitle         = document.createElement('p');
    mixedTitle.style.cssText = 'font-family:Space Mono,monospace;font-size:10px;color:#ffd60a;margin:12px 0 8px;letter-spacing:1px;width:100%;';
    mixedTitle.textContent   = '// MIXED CANON/FILLER:';
    wrap.appendChild(mixedTitle);

    const mixedRanges = groupRanges(data.mixedEps);
    mixedRanges.forEach(r => {
      const chip         = document.createElement('span');
      chip.className     = 'ep-chip';
      chip.style.cssText = 'background:#1a1400;color:#ffd60a;border-color:#2a2000;';
      chip.textContent   = 'EP ' + r;
      wrap.appendChild(chip);
    });
  }

  // advice
  const adviceEl = document.getElementById('canon-advice');
  if (fillerPct === 0) {
    adviceEl.textContent = '💡 Clean watch — no fillers at all. Enjoy every episode!';
  } else if (fillerPct < 15) {
    adviceEl.textContent = `💡 Only ${fillerPct}% filler — not bad. Skip the marked episodes and you're good.`;
  } else if (fillerPct < 40) {
    adviceEl.textContent = `💡 ${fillerPct}% filler — skip all marked episodes for the best experience.`;
  } else {
    adviceEl.textContent = `💀 ${fillerPct}% filler — that's brutal. Skip everything marked or just read the manga instead.`;
  }
}

// ── GROUP CONSECUTIVE EPS INTO RANGES ──
function groupRanges(eps) {
  if (!eps || !eps.length) return [];
  const sorted = [...eps].sort((a, b) => a - b);
  const ranges = [];
  let start = sorted[0], end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`);
      start = sorted[i];
      end   = sorted[i];
    }
  }
  ranges.push(start === end ? `${start}` : `${start}–${end}`);
  return ranges;
}

// ── FETCH POSTER FROM JIKAN ──
async function fetchAnimePoster(title) {
  try {
    const res  = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      document.getElementById('filler-poster').src = data.data[0].images.jpg.image_url;
    }
  } catch (err) {
    console.error('Poster fetch failed:', err);
  }
}

// ── ENTER KEY ──
document.getElementById('filler-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkFiller();
});

// ── INIT ──
loadFillerDB();