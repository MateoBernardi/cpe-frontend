/* Foro feed — render category strips + infinite scroll */
(function () {
  const stripsEl = document.getElementById('strips');
  const loader = document.getElementById('loader');

  const initials = (name) =>
    name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  let itemSeq = 0;
  function itemHTML(cat, item) {
    const tag = `<span class="tag ${cat.cls}"><span class="dot"></span>${cat.name}</span>`;
    const n = String(++itemSeq).padStart(3, '0');
    const title = item.link ? `<a href="${item.link}">${item.title}</a>` : item.title;

    if (cat.foro) {
      const dots = Array.from({ length: 3 })
        .map((_, i) => `<span class="avatar" style="background:var(--teal-tint)">${String.fromCharCode(65 + ((item.title.length + i) % 26))}</span>`).join('');
      return `<article class="list-item is-foro">
        <div class="text">
          <div class="idx">HILO · N.${n}</div>
          ${tag}
          <h3>${title}</h3>
          <p class="excerpt">${item.excerpt}</p>
          <div class="stat">
            <div class="avatars">${dots}</div>
            <span><b>${item.replies}</b> respuestas</span>
            <span class="dotsep"></span>
            <span><b>${item.people}</b> participando</span>
          </div>
        </div>
      </article>`;
    }

    const metaIcon = item.podcast
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="color:var(--spotify)"><circle cx="12" cy="12" r="11"/></svg>`
      : '';
    return `<article class="list-item" style="--cat:var(--c-${cat.id})">
      <div class="ph thumb"><span>img</span></div>
      <div class="text">
        <div class="idx">N.${n}</div>
        ${tag}
        <h3>${title}</h3>
        <p class="excerpt">${item.excerpt}</p>
        <div class="card-meta">
          <span class="avatar">${initials(item.author)}</span>
          <span>${item.author}</span>
          <span class="dotsep"></span>
          ${metaIcon}<span>${item.meta}</span>
        </div>
      </div>
    </article>`;
  }

  function stripHTML(cat, items, anchor) {
    const rows = items.map(it => itemHTML(cat, it)).join('');
    return `<section class="strip ${cat.cls}" ${anchor ? `id="${cat.id}"` : ''}>
      <div class="sec-head" style="--cat:var(--c-${cat.id})">
        <div class="title">
          <h2>${cat.name}</h2>
          <span class="count">${cat.count}</span>
        </div>
        <a class="sec-link" href="#">Ver todo →</a>
      </div>
      <div class="list">${rows}</div>
    </section>`;
  }

  stripsEl.insertAdjacentHTML('beforeend',
    window.FORO_CATEGORIES.map(c => stripHTML(c, c.items, true)).join(''));

  let round = 0;
  const order = ['novedades', 'papers', 'foros', 'podcasts'];
  const byId = Object.fromEntries(window.FORO_CATEGORIES.map(c => [c.id, c]));

  function makeMoreStrip() {
    const id = order[round % order.length];
    const cat = byId[id];
    const pool = window.FORO_MORE[id];
    const base = (round * 3);
    const items = Array.from({ length: 3 }).map((_, i) => {
      const title = pool[(base + i) % pool.length];
      if (cat.foro) {
        return { title, excerpt: 'Sumá tu experiencia a esta conversación de la comunidad.', replies: 8 + ((base + i) * 7) % 40, people: 4 + ((base + i) * 3) % 20 };
      }
      return {
        title,
        excerpt: 'Una mirada práctica para empresas que están creciendo y profesionalizándose.',
        author: ['Equipo CPE', 'M. Robles', 'J. Funes', 'D. Acuña'][(base + i) % 4],
        meta: 'Jun 2026',
        podcast: cat.id === 'podcasts',
      };
    });
    round++;
    return stripHTML(cat, items, false);
  }

  let loading = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting || loading) return;
    loading = true;
    setTimeout(() => {
      stripsEl.insertAdjacentHTML('beforeend', makeMoreStrip());
      if (round < 8) stripsEl.insertAdjacentHTML('beforeend', makeMoreStrip());
      loading = false;
      if (round >= 8) {
        io.disconnect();
        loader.innerHTML = 'Llegaste al final del feed por ahora ✦';
      }
    }, 650);
  }, { rootMargin: '400px' });

  io.observe(loader);

  // ---- category view (all items grouped in sub-sections), driven by the header nav ----
  const heroEl = document.querySelector('.foro-hero');
  const feedEl = document.getElementById('feed');
  const catView = document.createElement('main');
  catView.id = 'catview';
  catView.style.display = 'none';
  feedEl.after(catView);

  function mkItem(cat, title, i) {
    if (cat.foro) return { title, excerpt: 'Sumá tu experiencia a esta conversación de la comunidad.', replies: 8 + (i * 13) % 50, people: 4 + (i * 5) % 22 };
    return {
      title,
      excerpt: 'Una mirada práctica para empresas que crecen y se profesionalizan.',
      author: ['Equipo CPE', 'M. Robles', 'J. Funes', 'D. Acuña'][i % 4],
      meta: 'Jun 2026',
      podcast: cat.id === 'podcasts',
      link: (cat.id === 'podcasts' && i === 0) ? 'Foro - Podcast.html' : undefined,
    };
  }

  function showCategory(id) {
    const cat = byId[id];
    const subs = window.FORO_SUBSECTIONS[id] || [];
    let html = `<div class="wrap"><div style="margin:8px 0 40px">
      <span class="tag ${cat.cls}"><span class="dot"></span>${cat.count}</span>
      <h2 style="font-size:40px;margin-top:12px">${cat.name}</h2>
      <p style="color:var(--muted);font-size:16.5px;margin-top:10px;max-width:60ch;line-height:1.5">${cat.blurb}.</p>
    </div>`;
    html += subs.map(s => {
      const rows = s.titles.map((t, i) => itemHTML(cat, mkItem(cat, t, i))).join('');
      return `<section class="strip"><div class="sec-head" style="--cat:var(--c-${id})">
        <div class="title"><h2>${s.name}</h2></div><a class="sec-link" href="#">Ver todo →</a></div>
        <div class="list">${rows}</div></section>`;
    }).join('') + '</div>';
    catView.innerHTML = html;
    heroEl.style.display = 'none';
    feedEl.style.display = 'none';
    catView.style.display = '';
    window.scrollTo(0, 0);
  }
  function showTodo() {
    heroEl.style.display = '';
    feedEl.style.display = '';
    catView.style.display = 'none';
  }

  const navMap = { papers: 'papers', podcasts: 'podcasts', novedades: 'novedades', 'discusión': 'foros', foro: null };
  const navLinks = [...document.querySelectorAll('.nav-links a')];
  navLinks.forEach(a => {
    const key = a.textContent.trim().toLowerCase();
    if (!(key in navMap)) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = navMap[key];
      navLinks.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
      id ? showCategory(id) : showTodo();
    });
  });
})();
