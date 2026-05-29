/* =========================================================
   ASURA — main.js
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1. Scroll Reveal
   IntersectionObserver で .reveal 要素をフェードイン
   --------------------------------------------------------- */
(function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.artist-card, .sns-btn, .section-title'
  );

  targets.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
})();


/* ---------------------------------------------------------
   2. Hero image placeholder fallback
   画像が見つからない場合はシルエット SVG をインライン表示
   --------------------------------------------------------- */
(function heroImageFallback() {
  const img = document.querySelector('.hero__img');
  if (!img) return;

  img.addEventListener('error', () => {
    img.style.display = 'none';

    const wrap = img.closest('.hero__image-wrap');
    if (!wrap) return;

    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';

    // シンプルな人型シルエット（SVG）
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.setAttribute('viewBox', '0 0 100 100');
    svgEl.setAttribute('width', '60%');
    svgEl.setAttribute('fill', 'none');
    svgEl.setAttribute('stroke', '#c9a84c');
    svgEl.setAttribute('stroke-width', '2');
    svgEl.setAttribute('aria-hidden', 'true');
    svgEl.innerHTML = `
      <circle cx="50" cy="28" r="14"/>
      <path d="M20 85 C20 60 35 50 50 50 C65 50 80 60 80 85"/>
    `;
    wrap.appendChild(svgEl);

    // 「PHOTO」テキスト
    const label = document.createElement('span');
    label.textContent = 'PHOTO';
    label.style.cssText =
      'position:absolute;bottom:18%;font-family:"Cinzel",serif;font-size:0.6rem;letter-spacing:0.25em;color:#c9a84c;opacity:0.6;';
    wrap.style.position = 'relative';
    wrap.appendChild(label);
  });
})();


/* ---------------------------------------------------------
   3. Smooth scroll for anchor links
   --------------------------------------------------------- */
(function smoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();


/* ---------------------------------------------------------
   4. Flame intensity: マウス・タッチ位置で炎の揺らぎを変える
   --------------------------------------------------------- */
(function dynamicFlames() {
  const flames = document.querySelectorAll('.flame');
  if (!flames.length) return;

  let rafId = null;
  let targetIntensity = 1;
  let currentIntensity = 1;

  function onPointerMove(e) {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const ratio = 1 - y / window.innerHeight; // 上に行くほど強く
    targetIntensity = 0.7 + ratio * 0.8;
  }

  function tick() {
    currentIntensity += (targetIntensity - currentIntensity) * 0.05;
    flames.forEach((f) => {
      f.style.setProperty('--intensity', currentIntensity);
    });
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  tick();
})();


/* ---------------------------------------------------------
   5. Ember particles — canvas で火の粉を演出
   --------------------------------------------------------- */
(function emberParticles() {
  const canvas = document.querySelector('.ember-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COLORS = ['#ff6a00','#ff9500','#ffc200','#c9a84c','#ff3300'];

  class Ember {
    constructor() { this.reset(true); }

    reset(init = false) {
      this.x   = Math.random() * canvas.width;
      this.y   = init ? Math.random() * canvas.height : canvas.height + 4;
      this.r   = Math.random() * 1.8 + 0.5;
      this.vx  = (Math.random() - 0.5) * 0.6;
      this.vy  = -(Math.random() * 1.2 + 0.4);
      this.life = 0;
      this.maxLife = Math.random() * 180 + 80;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    update() {
      this.x += this.vx + Math.sin(this.life * 0.04) * 0.3;
      this.y += this.vy;
      this.life++;
      if (this.life > this.maxLife || this.y < -10) this.reset();
    }

    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.85;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }

  const embers = Array.from({ length: 60 }, () => new Ember());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    embers.forEach(e => { e.update(); e.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ---------------------------------------------------------
   7. Artist card: ホバー時に曲数バッジを表示
   --------------------------------------------------------- */
(function songCountBadge() {
  document.querySelectorAll('.artist-card').forEach((card) => {
    const count = card.querySelectorAll('.song-list li').length;
    if (count <= 1) return; // 1曲ならバッジ不要

    const badge = document.createElement('span');
    badge.textContent = `${count} songs`;
    badge.style.cssText = `
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      font-family: 'Cinzel', serif;
      font-size: 0.6rem;
      letter-spacing: 0.1em;
      color: var(--muted, #7a7060);
      opacity: 0;
      transition: opacity 0.3s;
    `;
    card.style.position = 'relative';
    card.appendChild(badge);

    card.addEventListener('mouseenter', () => { badge.style.opacity = '1'; });
    card.addEventListener('mouseleave', () => { badge.style.opacity = '0'; });
  });
})();
