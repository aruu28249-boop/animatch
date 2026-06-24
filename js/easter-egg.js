/**
 * AniMatch — Easter Egg (easter-egg.js)
 * Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
 * Triggers a confetti burst + screen glitch + secret message.
 * Include this file on every page via <script src="js/easter-egg.js"></script>
 */

(function () {
  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];

  let inputBuffer = [];
  let alreadyTriggered = false;

  document.addEventListener('keydown', (e) => {
    // Normalize key (b/a should work regardless of case)
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    inputBuffer.push(key);

    // Keep buffer only as long as the code itself
    if (inputBuffer.length > KONAMI_CODE.length) {
      inputBuffer.shift();
    }

    // Check match
    if (
      inputBuffer.length === KONAMI_CODE.length &&
      inputBuffer.every((k, i) => k === KONAMI_CODE[i])
    ) {
      triggerEasterEgg();
      inputBuffer = []; // reset so it can be triggered again later
    }
  });

  function triggerEasterEgg() {
    if (alreadyTriggered) return; // prevent spam-triggering while animation plays
    alreadyTriggered = true;

    glitchScreen();
    launchConfetti();
    showSecretMessage();

    setTimeout(() => { alreadyTriggered = false; }, 5500);
  }

  // ── SCREEN SHAKE + FLASH EFFECT ──
  function glitchScreen() {
    const style = document.createElement('style');
    style.id = 'easter-egg-glitch-style';
    style.textContent = `
      @keyframes eeShake {
        0%   { transform: translate(0,0) rotate(0deg); }
        10%  { transform: translate(-10px, -6px) rotate(-1deg); }
        20%  { transform: translate(12px, 4px) rotate(1deg); }
        30%  { transform: translate(-14px, 6px) rotate(-2deg); }
        40%  { transform: translate(14px, -8px) rotate(2deg); }
        50%  { transform: translate(-10px, 8px) rotate(-1deg); }
        60%  { transform: translate(10px, -6px) rotate(1deg); }
        70%  { transform: translate(-8px, 4px) rotate(-1deg); }
        80%  { transform: translate(8px, -4px) rotate(1deg); }
        90%  { transform: translate(-4px, 2px) rotate(0deg); }
        100% { transform: translate(0,0) rotate(0deg); }
      }
      @keyframes eeFlash {
        0%   { background: rgba(255,0,60,0); }
        8%   { background: rgba(255,0,60,0.55); }
        16%  { background: rgba(255,255,255,0.85); }
        24%  { background: rgba(0,245,212,0.5); }
        32%  { background: rgba(255,0,60,0); }
        100% { background: rgba(255,0,60,0); }
      }
      .ee-glitching {
        animation: eeShake 0.6s ease-in-out 2;
      }
      .ee-flash-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 99998;
        animation: eeFlash 0.6s ease-out 2;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('ee-glitching');

    const flash = document.createElement('div');
    flash.className = 'ee-flash-overlay';
    document.body.appendChild(flash);

    setTimeout(() => {
      document.body.classList.remove('ee-glitching');
      flash.remove();
      style.remove();
    }, 1300);
  }

  // ── FLOATING ANIME EMOJIS ──
  function launchConfetti() {
    const emojis = ['😭', '🔥', '💀', '⚡', '🗿', '😤', '💢'];
    const emojiCount = 35;
    const container = document.createElement('div');
    container.id = 'easter-egg-confetti';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    container.style.overflow = 'hidden';
    document.body.appendChild(container);

    for (let i = 0; i < emojiCount; i++) {
      const piece = document.createElement('div');
      const size = Math.random() * 20 + 20; // 20px–40px
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const startX = Math.random() * 100;
      const duration = Math.random() * 2.5 + 2.5;
      const delay = Math.random() * 0.6;
      const drift = (Math.random() - 0.5) * 200; // horizontal sway in px
      const rotation = (Math.random() - 0.5) * 60;

      piece.textContent = emoji;
      piece.style.position = 'absolute';
      piece.style.top = '-40px';
      piece.style.left = `${startX}vw`;
      piece.style.fontSize = `${size}px`;
      piece.style.opacity = '0.95';
      piece.style.setProperty('--drift', `${drift}px`);
      piece.style.setProperty('--rot', `${rotation}deg`);
      piece.style.animation = `eeFloat ${duration}s ${delay}s ease-in forwards`;

      container.appendChild(piece);
    }

    // Inject float animation once
    if (!document.getElementById('easter-egg-confetti-style')) {
      const fallStyle = document.createElement('style');
      fallStyle.id = 'easter-egg-confetti-style';
      fallStyle.textContent = `
        @keyframes eeFloat {
          to {
            transform: translateY(110vh) translateX(var(--drift)) rotate(var(--rot));
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(fallStyle);
    }

    setTimeout(() => container.remove(), 5500);
  }

  // ── SECRET MESSAGE ──
  function showSecretMessage() {
    const messages = [
      "Ok you're definitely an otaku 👀",
      "Secret unlocked. Respect. 🎌",
      "You found the hidden easter egg!",
      "Konami code in an anime site? Bold. 🔥",
      "10/10 nerd energy detected."
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];

    const box = document.createElement('div');
    box.textContent = msg;
    box.style.position = 'fixed';
    box.style.top = '50%';
    box.style.left = '50%';
    box.style.transform = 'translate(-50%, -50%) scale(0.8)';
    box.style.background = '#0f0f14';
    box.style.border = '1px solid #ffd60a';
    box.style.color = '#ffd60a';
    box.style.fontFamily = "'Bebas Neue', sans-serif";
    box.style.fontSize = '1.6rem';
    box.style.letterSpacing = '0.05em';
    box.style.padding = '24px 36px';
    box.style.borderRadius = '8px';
    box.style.boxShadow = '0 0 40px rgba(255,214,10,0.4)';
    box.style.zIndex = '100000';
    box.style.opacity = '0';
    box.style.transition = 'opacity 0.3s, transform 0.3s';
    box.style.textAlign = 'center';
    box.style.pointerEvents = 'none';

    document.body.appendChild(box);

    requestAnimationFrame(() => {
      box.style.opacity = '1';
      box.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    setTimeout(() => {
      box.style.opacity = '0';
      box.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => box.remove(), 300);
    }, 2800);
  }
})();