/* DISHA CMS – Dashboard (replica of the approved mockup).
   Reads the same data sources as the rest of the CMS (getList / DB). Requires Chart.js (loaded in pages/dashboard.html). */
window.Modules = window.Modules || {};
Modules.dashboard = root => {
  const C = { deep: '#0B5D3B', leaf: '#1E9E62', gold: '#F0AC38', mint: '#CFE8DB', mintBar: '#BFE0CD', ink: '#12372A', mute: '#5C7068' };
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const p = DB.get('profile', SEED.profile()), now = new Date();
  const hp = Content.homeInfo();
  const sv = getList('services'), pr = getList('testimonials'), bl = getList('blogs'), pg = getList('pages'), vs = getList('versions');
  const hr = now.getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const first = String(p.name || 'Admin').split(' ')[0];
  const dateLong = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const plural = (n, a, b) => n === 1 ? a : b;
  const parseD = s => /^\d{4}-\d\d-\d\d$/.test(String(s)) ? new Date(s + 'T00:00:00') : new Date(s);

  /* ---- data ---- */
  const live = { services: sv.filter(x => x.status === 'Active').length, products: pr.filter(x => x.status === 'Approved').length, blogs: bl.filter(x => x.status === 'Published').length, pages: pg.filter(x => x.status === 'Published').length };
  const total = { services: sv.length, products: pr.length, blogs: bl.length, pages: pg.length };
  const monthsBack = n => [...Array(n)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1) + i, 1); const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    return {
      k, l: d.toLocaleDateString('en-IN', { month: 'short' }), full: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), end: new Date(d.getFullYear(), d.getMonth() + 1, 1)
    }
  });
  const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  const blogsMonth = bl.filter(b => String(b.date).startsWith(ym)).length;
  const blogSeries = monthsBack(6).map(m => bl.filter(b => parseD(b.date) < m.end).length);
  /* ---- helpers ---- */
  const rel = d => { const x = new Date(d); if (isNaN(x)) return '-'; const m = Math.round((now - x) / 6e4); if (m < 1) return 'Just now'; if (m < 60) return m + 'm ago'; const h = Math.round(m / 60); if (h < 24) return h + 'h ago'; const dd = Math.round(h / 24); return dd < 8 ? dd + 'd ago' : fmtDate(d) };
  const shortDT = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }) };
  const spark = (vals, col, id) => {
    const W = 160, H = 60, mx = Math.max(...vals), mn = Math.min(...vals), rg = (mx - mn) || 1;
    const pts = vals.map((v, i) => [i * (W / (vals.length - 1)), H - 8 - ((v - mn) / rg) * (H - 22) - (mx === mn ? 10 : 0)]);
    let d = 'M' + pts[0][0] + ' ' + pts[0][1]; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], cx = (a[0] + b[0]) / 2; d += ` C${cx} ${a[1]} ${cx} ${b[1]} ${b[0]} ${b[1]}` }
    return `<svg class="db-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".25"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${W} ${H} L0 ${H}Z" fill="url(#${id})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`
  };
  const wave = (col, id) => `<svg class="db-spark" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".22"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="M0 46 C30 44 40 30 70 34 S115 18 160 6 L160 60 L0 60Z" fill="url(#${id})"/></svg>`;

  /* ---- stat cards ---- */
  const chk = t => `${ic('check-circle-2')}${t}`;
  const stats = [
    { l: 'Total Services', n: total.services, i: 'stethoscope', h: 'services.html', g: '', d: chk(live.services + ' active'), art: wave(C.leaf, 'sp1') },
    { l: 'Testimonials', n: total.products, i: 'message-square-quote', h: 'testimonials.html', g: '', d: chk(live.products + ' approved'), art: wave(C.leaf, 'sp2') },
    { l: 'Total Blogs', n: total.blogs, i: 'square-pen', h: 'blogs.html', g: '', d: `${ic('arrow-up')}${blogsMonth > 0 ? '+' : ''}${blogsMonth} this month`, art: spark(blogSeries, C.leaf, 'sp3') },
    { l: 'Website Pages', n: total.pages, i: 'file-text', h: 'page-management.html', g: '', d: chk(live.pages + ' published'), art: wave(C.leaf, 'sp4') }];
  const statsH = stats.map(s => `<a class="db-stat ${s.g}" href="${s.h}" aria-label="${s.l}: ${s.n}. Open module">${s.art}<div class="db-ico">${ic(s.i)}</div><div class="db-st-t"><div class="l">${s.l}</div><div class="n" data-count="${s.n}">${s.n}</div><div class="d">${s.d}</div></div></a>`).join('');

  /* ---- hero art ---- */
  const heroArt = `<svg class="db-hero-art" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stop-color="#BFE0CD" stop-opacity="0"/><stop offset=".55" stop-color="#7FC8A0" stop-opacity=".55"/><stop offset="1" stop-color="#2E8F62" stop-opacity=".75"/></linearGradient><linearGradient id="hg2" x1="0" x2="1"><stop offset="0" stop-color="#F0AC38" stop-opacity="0"/><stop offset=".6" stop-color="#F0AC38"/><stop offset="1" stop-color="#F7CE76"/></linearGradient></defs>
  <path d="M470 140 C640 135 700 30 860 18 C960 10 1010 4 1060 -6 L1200 -6 L1200 140Z" fill="url(#hg)" opacity=".55"/>
  <path d="M600 140 C760 130 820 40 960 30 C1050 24 1100 10 1140 0 L1200 0 L1200 70 C1100 60 1020 90 940 92 C830 96 760 140 700 140Z" fill="url(#hg)" opacity=".6"/>
  <path d="M780 -4 C900 30 1010 24 1090 -8" fill="none" stroke="url(#hg2)" stroke-width="5" stroke-linecap="round"/></svg>`;
  const steth = `<svg class="db-steth" viewBox="0 0 170 100" aria-hidden="true"><defs><radialGradient id="sg" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#C9D3D8"/><stop offset="1" stop-color="#7F8E96"/></radialGradient></defs>
  <path d="M34 8 C34 44 54 56 74 56 M112 8 C112 44 94 56 74 56" fill="none" stroke="#5D6E76" stroke-width="5" stroke-linecap="round"/><circle cx="34" cy="7" r="5" fill="#8A989F"/><circle cx="112" cy="7" r="5" fill="#8A989F"/>
  <path d="M74 56 C74 92 128 98 140 76 C148 62 134 52 124 60" fill="none" stroke="#5D6E76" stroke-width="5" stroke-linecap="round"/><circle cx="122" cy="64" r="15" fill="url(#sg)" stroke="#6C7C84" stroke-width="2"/><circle cx="122" cy="64" r="8" fill="#E8EEF0" stroke="#9AA8AF" stroke-width="1.5"/></svg>`;
  const leaves = `<svg class="db-leaf" viewBox="0 0 150 120" preserveAspectRatio="xMaxYMax meet" aria-hidden="true"><defs><linearGradient id="lf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E9A62"/><stop offset="1" stop-color="#0B5D3B"/></linearGradient></defs>
  <path d="M140 120 C100 110 90 60 120 10 C150 50 150 90 140 120Z" fill="url(#lf)"/><path d="M104 120 C70 112 62 78 78 44 C104 70 110 96 104 120Z" fill="#2E9A62" opacity=".85"/><path d="M146 120 C132 100 140 80 150 66Z" fill="#0B5D3B"/><path d="M140 118 C133 80 128 50 120 14" stroke="#CFE8DB" stroke-width="1.5" fill="none" opacity=".7"/></svg>`;

  /* ---- bottom row ---- */
  const hpLive = hp.status === 'Published';
  const liveAll = live.services + live.products + live.blogs + live.pages, allAll = total.services + total.products + total.blogs + total.pages;
  const last = hp.updated ? ['Last Homepage Update', fmtDT(hp.updated)] : vs[0] ? ['Last Update', fmtDT(vs[0].date)] : ['Last Update', 'Not saved yet'];

  root.innerHTML = `<div class="db-cq"><div class="db">
 <div class="db-title"><div><h1>Dashboard</h1><p>Clinic overview at a glance</p></div></div>

 <section class="db-hero">${heroArt}
  <div class="db-mark"><img src="../assets/images/logo/emblem.png" alt="DISHA Clinic logo"></div><div class="db-sep"></div>
  <div class="db-hello"><h2>${greet}, ${esc(first)} <span aria-hidden="true"></span></h2><p>Manage your DISHA Clinic website and track performance effortlessly.</p><span class="db-date">${ic('calendar-days')}${esc(dateLong)}</span></div>
  <div class="db-tag">${steth}<div class="db-tag-t">Your Health,<b>Our Priority</b></div></div>
 </section>

 <section class="db-stats">${statsH}</section>

 <section class="db-grid">
  <div class="db-card"><div class="db-ch"><h3>${ic('globe')}Website Content</h3></div><div class="db-cb"><div class="db-plot"><canvas id="chBar" role="img" aria-label="Website content by type"></canvas></div></div></div>
  <div class="db-card"><div class="db-ch"><h3>${ic('zap')}Quick Actions</h3></div><div class="db-cb"><div class="db-qa">
   <a class="t" href="services.html?new=1">${ic('plus-circle')}<span>Add New Service</span></a><a class="t" href="blogs.html?new=1">${ic('pen-line')}<span>Create New Blog</span></a>
   <a class="t" href="homepage-builder.html#hero">${ic('image')}<span>Change Homepage Banner</span></a><a class="t" href="website-settings.html">${ic('settings')}<span>Edit Website Settings</span></a>
   <a class="w" href="#view" data-view>${ic('globe')}View Website ${ic('arrow-right')}</a></div></div></div>
  <div class="db-card db-ws"><div class="db-ch"><h3>${ic('globe')}Website Status Overview</h3></div><div class="db-cb">
   <div class="db-live ${hpLive ? '' : 'warn'}"><span class="ck">${ic(hpLive ? 'check' : 'pencil')}</span><div><b>${hpLive ? 'Your Website is Live!' : 'Homepage is in Draft'}</b><span>${hpLive ? `${liveAll} of ${allAll} content items are live.` : 'Publish the homepage to take it live.'}</span></div></div>
   <div class="db-sc"><div class="k">Published Pages</div><div class="v">${live.pages} <small>/ ${total.pages}</small></div><div class="db-trk"><span class="db-fill" data-w="${pct(live.pages, total.pages)}"></span></div></div>
   <div class="db-sc"><div class="k">Published Blogs</div><div class="v">${live.blogs} <small>/ ${total.blogs}</small></div><div class="db-trk"><span class="db-fill g" data-w="${pct(live.blogs, total.blogs)}"></span></div></div>
   <div class="db-last">${ic('clock')}<div><span class="k">${last[0]}</span><span class="v">${esc(last[1])}</span></div></div>
  </div></div>
 </section>

 </div></div>`;

  /* ---- behaviour ---- */
  $('[data-view]', root).onclick = e => { e.preventDefault(); const u = (/\.example/.test(Content.d.settings.siteUrl) ? '' : Content.d.settings.siteUrl); u && /^https?:\/\//.test(u) ? window.open(u, '_blank', 'noopener') : Toast.show('Enter the approved website URL in Website Settings to enable this link.', 'error') };
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.db-fill', root).forEach(f => f.style.width = f.dataset.w + '%')));
  $$('[data-count]', root).forEach(el => { const n = +el.dataset.count; if (reduce || !n) return; const t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 700); el.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); k < 1 && requestAnimationFrame(step) }; el.textContent = '0'; requestAnimationFrame(step) });
  icons();

  /* ---- charts (self-contained SVG – no external chart library needed) ---- */
  const gridC = '#E3EEE7';
  const nice = (mx, min) => { mx = Math.max(mx, min); let st = 1; if (mx > 5) { const r = mx / 5, p = Math.pow(10, Math.floor(Math.log10(r))), f = r / p; st = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p } return { st, top: Math.ceil(mx / st) * st } };
  const T = (x, y, t, o = '') => `<text x="${x}" y="${y}" ${o}>${t}</text>`;
  const rbar = (x, y, w, h, r) => { if (h <= 0) return ''; r = Math.min(r, h, w / 2); return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z` };
  const tipAttr = (...l) => `data-tip="${esc(l.join('\n'))}"`;
  /* grid + y labels + x labels shared by the cartesian charts */
  const frame = (w, h, L, pl, pr, pt, pb, ax) => {
    const iw = w - pl - pr, ih = h - pt - pb, y = v => pt + ih - v / ax.top * ih; let s = '';
    for (let v = 0; v <= ax.top; v += ax.st) { s += `<line x1="${pl}" x2="${w - pr}" y1="${y(v)}" y2="${y(v)}" stroke="${gridC}"/>` + T(pl - 8, y(v) + 4, v, `text-anchor="end" fill="${C.ink}" font-size="12"`) }
    L.forEach((l, i) => s += T(pl + (i + .5) * iw / L.length, h - 6, esc(l), `text-anchor="middle" fill="${C.ink}" font-size="12"`));
    return { s, iw, ih, y }
  };
  const mount = (id, draw) => {
    const cv = $('#' + id, root); if (!cv) return; const h = cv.parentElement; cv.style.display = 'none';
    let box = h.querySelector('.db-svg[data-for="' + id + '"]'); if (!box) {
      box = document.createElement('div'); box.className = 'db-svg'; box.dataset.for = id; h.appendChild(box);
      const tt = document.createElement('div'); tt.className = 'db-tt'; box.appendChild(tt);
      box.addEventListener('mousemove', e => {
        const el = e.target.closest && e.target.closest('[data-tip]'); if (!el) { tt.style.opacity = 0; return }
        const [a, ...b] = el.getAttribute('data-tip').split('\n'), r = box.getBoundingClientRect();
        tt.innerHTML = (a ? `<b>${a}</b>` : '') + b.map(x => `<span>${x}</span>`).join(''); tt.style.left = Math.min(Math.max(e.clientX - r.left, 60), r.width - 60) + 'px'; tt.style.top = (e.clientY - r.top) + 'px'; tt.style.opacity = 1
      });
      box.addEventListener('mouseleave', () => tt.style.opacity = 0)
    }
    const render = () => {
      const r = box.getBoundingClientRect(), w = Math.round(r.width), hh = Math.round(r.height); if (w < 20 || hh < 20) return; let svg = box.querySelector('svg'); if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); box.insertBefore(svg, box.firstChild) }
      svg.setAttribute('viewBox', `0 0 ${w} ${hh}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', cv.getAttribute('aria-label') || ''); svg.setAttribute('font-family', "Inter,system-ui,sans-serif"); svg.innerHTML = draw(w, hh)
    };
    render(); if (window.ResizeObserver) { if (box._ro) box._ro.disconnect(); box._ro = new ResizeObserver(render); box._ro.observe(box) } else addEventListener('resize', render)
  };

  const rows = [['Services', total.services, live.services, '#0B5D3B'], ['Testimonials', total.products, live.products, '#1E9E62'], ['Blogs', total.blogs, live.blogs, '#F0AC38'], ['Pages', total.pages, live.pages, '#BFE0CD']];
  mount('chBar', (w, h) => {
    const ax = nice(Math.max(...rows.map(r => r[1])), 4), f = frame(w, h, rows.map(r => r[0]), 32, 8, 26, 26, ax), band = f.iw / rows.length, bw = Math.min(56, band * .7);
    return f.s + rows.map((r, i) => {
      const cx = 32 + (i + .5) * band, y = f.y(r[1]); return `<path d="${rbar(cx - bw / 2, y, bw, f.y(0) - y, 6)}" fill="${r[3]}"/>${T(cx, y - 8, r[1], `text-anchor="middle" fill="${C.ink}" font-size="14" font-weight="600"`)}
   <rect x="${32 + i * band}" y="26" width="${band}" height="${f.ih}" fill="transparent" ${tipAttr(r[0], r[1] + ' in total', r[2] + ' live, ' + (r[1] - r[2]) + ' not live')}/>`
    }).join('')
  });


};
