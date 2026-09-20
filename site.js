/* ==========================================================================
   Bunny Arts — motor do site
   Lê os dados de content.js (window.SITE_CONTENT) e monta a página.
   Para editar textos, fotos e links use o editor: abra  index.html#admin
   ========================================================================== */
(() => {
  'use strict';

  const BA = (window.BA = window.BA || {});
  BA.edit = false;          // true quando o editor está aberto
  BA.images = {};           // referências "idb:..." -> URL temporária (usadas só pelo editor)
  BA.filter = 'all';
  BA.site = JSON.parse(JSON.stringify(window.SITE_CONTENT || {}));

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const g = (p, o = BA.site) => String(p).split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl = (s) => esc(s).replace(/\n/g, '<br>');
  const col = (v, d = '#000000') => (/^#[0-9a-f]{3,8}$/i.test(String(v || '').trim()) ? String(v).trim() : d);
  const src = (r) => BA.images[r] || r || '';
  BA.src = src;

  /* ---------- tipografias dos modelos de marca ---------- */
  const FONTS = {
    bebas: { label: 'Bebas Neue — fina, caixa alta', css: "'Bebas Neue', Impact, 'Arial Narrow', sans-serif", weight: 400, track: '.01em' },
    fraunces: { label: 'Fraunces — serifada elegante', css: "Fraunces, Georgia, 'Times New Roman', serif", weight: 700, track: '-.03em' },
    space: { label: 'Space Grotesk — moderna', css: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif", weight: 700, track: '-.05em' },
    poppins: { label: 'Poppins — redonda e forte', css: "'Poppins', 'Segoe UI', system-ui, sans-serif", weight: 800, track: '-.05em' },
    playfair: { label: 'Playfair Display — clássica', css: "'Playfair Display', Georgia, 'Times New Roman', serif", weight: 800, track: '-.02em' },
    baloo: { label: 'Baloo 2 — divertida', css: "'Baloo 2', 'Trebuchet MS', 'Segoe UI', sans-serif", weight: 800, track: '-.02em' }
  };
  BA.FONTS = FONTS;
  const fontOf = (b) => FONTS[b.font] || FONTS.poppins;

  /* ---------- símbolos (viewBox 0 0 100 100) ---------- */
  const MARKS = {
    flame: (a, i) => `<path d="M50 6c4 16 24 26 28 48a28 28 0 0 1-56 0c0-14 8-20 12-30 4 8 8 10 12 10-3-10-1-18 4-28z" fill="${a}"/><path d="M50 52c3 8 12 12 12 22a12 12 0 0 1-24 0c0-6 4-8 6-14 3 3 5 3 6 2z" fill="${i}"/>`,
    sun: (a, i) => `<circle cx="50" cy="50" r="18" fill="${a}"/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((d) => `<line x1="50" y1="14" x2="50" y2="26" stroke="${i}" stroke-width="7" stroke-linecap="round" transform="rotate(${d} 50 50)"/>`).join(''),
    compass: (a, i) => `<circle cx="50" cy="50" r="42" fill="none" stroke="${i}" stroke-width="7"/><polygon points="50,16 63,50 37,50" fill="${a}"/><polygon points="37,50 63,50 50,84" fill="${i}"/>`,
    dot: (a, i, k) => `<circle cx="50" cy="50" r="40" fill="${a}"/><text x="50" y="68" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-weight="800" font-size="54" fill="${k}">1</text>`,
    blade: (a, i, k) => `<path d="M50 6 88 20v30c0 24-16 38-38 46C28 88 12 74 12 50V20z" fill="${a}"/><path d="M36 68V33h6.5l15.5 23.5V33h6v35h-6.5L42 44.5V68z" fill="${k}"/>`,
    paw: (a) => `<ellipse cx="50" cy="66" rx="24" ry="20" fill="${a}"/><circle cx="21" cy="44" r="10" fill="${a}"/><circle cx="39" cy="24" r="10" fill="${a}"/><circle cx="61" cy="24" r="10" fill="${a}"/><circle cx="79" cy="44" r="10" fill="${a}"/>`
  };
  BA.MARKS = Object.keys(MARKS);

  const markInner = (b, a, i, k) => {
    if (b.mark === 'image' && b.markImg && b.markImg.src) {
      return `<image href="${esc(src(b.markImg.src))}" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>`;
    }
    return (MARKS[b.mark] || MARKS.dot)(a, i, k);
  };
  const markSVG = (b, a, i, k) => `<svg viewBox="0 0 100 100" aria-hidden="true">${markInner(b, a, i, k)}</svg>`;
  const label = (b) => (b.upper ? String(b.plain || '').toUpperCase() : String(b.plain || ''));

  const teeSVG = (b) => {
    const t = b.tee || {}; const f = fontOf(b); const text = esc(label(b));
    const fill = col(t.fill, '#111'); const ta = col(t.a, '#fff'); const ti = col(t.i, '#fff'); const tt = col(t.text, '#fff');
    return `<svg viewBox="0 0 300 320" role="img" aria-label="Camiseta ${esc(b.plain)}">
    <path d="M104 18C114 44 186 44 196 18L260 44 294 112 250 134 232 104V300H68V104L50 134 6 112 40 44Z" fill="${fill}"/>
    <path d="M104 18C114 44 186 44 196 18" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(110 78) scale(.8)">${markInner(b, ta, ti, fill)}</g>
    <text x="150" y="190" text-anchor="middle" font-family="${f.css}" font-weight="${f.weight}" font-size="21" fill="${tt}" textLength="${Math.min(130, Math.max(String(b.plain || '').length, 4) * 13)}" lengthAdjust="spacingAndGlyphs">${text}</text>
  </svg>`;
  };
  const stickerRound = (b, style = '', cls = 'sticker') => `<svg class="${cls}"${style ? ` style="${style}"` : ''} viewBox="0 0 120 120" role="img" aria-label="Adesivo ${esc(b.plain)}">
  <circle cx="60" cy="60" r="57" fill="#fff"/><circle cx="60" cy="60" r="50" fill="${col(b.bg)}"/>
  <g transform="translate(28 28) scale(.64)">${markInner(b, col(b.accent), col(b.ink), col(b.bg))}</g></svg>`;
  const stickerPill = (b, style = '') => {
    const f = fontOf(b);
    return `<svg class="sticker wide"${style ? ` style="${style}"` : ''} viewBox="0 0 280 96" role="img" aria-label="Adesivo ${esc(b.plain)}">
  <rect x="2" y="2" width="276" height="92" rx="46" fill="#fff"/><rect x="9" y="9" width="262" height="78" rx="39" fill="${col(b.bg)}"/>
  <g transform="translate(24 22) scale(.52)">${markInner(b, col(b.accent), col(b.ink), col(b.bg))}</g>
  <text x="92" y="60" font-family="${f.css}" font-weight="${f.weight}" font-size="27" fill="${col(b.ink)}" textLength="${Math.min(168, Math.max(String(b.plain || '').length, 4) * 15)}" lengthAdjust="spacingAndGlyphs">${esc(label(b))}</text></svg>`;
  };

  /* ---------- botões e links ---------- */
  function resolve(b) {
    b = b || {};
    const c = BA.site.contact || {};
    const msg = b.msg || 'Olá! Vim pelo site da Bunny Arts.';
    const custom = (b.url || '').trim();
    if (custom) return { ok: true, href: custom, ext: /^https?:/i.test(custom) };
    if (b.type === 'whatsapp') {
      const d = String(c.whatsapp || '').replace(/\D/g, '');
      return d ? { ok: true, ext: true, href: `https://wa.me/${d}?text=${encodeURIComponent(msg)}` } : { ok: false, href: '#contato' };
    }
    if (b.type === 'instagram') {
      const u = String(c.instagram || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '');
      return u ? { ok: true, ext: true, href: `https://instagram.com/${u}` } : { ok: false, href: '#contato' };
    }
    if (b.type === 'email') {
      const e = String(c.email || '').trim();
      return e ? { ok: true, ext: false, href: `mailto:${e}?subject=${encodeURIComponent('Orçamento — Bunny Arts')}&body=${encodeURIComponent(msg)}` } : { ok: false, href: '#contato' };
    }
    return { ok: false, href: '#contato' };
  }
  BA.resolve = resolve;

  const btn = (path, extra = '') => {
    const b = g(path) || {};
    const r = resolve(b);
    const cls = `btn${b.style ? ` btn-${esc(b.style)}` : ''}${extra}${r.ok ? '' : ' nolink'}`;
    return `<a class="${cls}" href="${esc(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ''}${BA.edit ? ` data-btn="${path}"` : ''}>${esc(b.label)}</a>`;
  };

  /* ---------- peças de markup ---------- */
  const T = (p, tag = 'span', attrs = '', ml = false) =>
    `<${tag}${attrs}${BA.edit ? ` data-p="${p}"${ml ? ' data-ml' : ''}` : ''}>${ml ? nl(g(p)) : esc(g(p))}</${tag}>`;

  const imgTag = (o, path, cls = '', lazy = true) => {
    if (!o) return '';
    const dims = o.w && o.h ? ` width="${o.w}" height="${o.h}"` : '';
    return `<img src="${esc(src(o.src))}" alt="${esc(o.alt)}"${dims}${cls ? ` class="${cls}"` : ''}${lazy ? ' loading="lazy" decoding="async"' : ''}${BA.edit ? ` data-img="${path}"` : ''}>`;
  };
  // no editor os botões viram <div> para poder digitar dentro deles
  const ib = (cls, attrs, inner) => (BA.edit ? `<div class="image-button ${cls}" ${attrs}>${inner}</div>` : `<button type="button" class="image-button ${cls}" ${attrs}>${inner}</button>`);
  const addTile = (path, text = '+ Adicionar foto') => (BA.edit ? `<button type="button" class="add-tile" data-add="${path}">${text}</button>` : '');

  const SEC_ID = { servicos: 'servicos', identidade: 'identidade-visual', icon: 'icon', logo: 'logo', camisetas: 'camisetas', adesivos: 'adesivos', social: 'social-media', criativos: 'criativos', modelos: 'modelos', planos: 'planos', processo: 'processo', sobre: 'sobre' };
  BA.SEC_ID = SEC_ID;

  const section = (key, cls, inner) =>
    `<section id="${SEC_ID[key]}" class="section ${cls} reveal${BA.edit ? ' visible' : ''}" data-sec="${key}" aria-labelledby="${SEC_ID[key]}-title">${BA.edit ? `<button type="button" class="edit-section" data-open="${key}">✎ Editar esta seção</button>` : ''}${inner}</section>`;

  const secHead = (key) => {
    const s = BA.site[key];
    return `<header class="service-head"><span class="service-num">${T(`${key}.num`)}</span>
      <div><div class="eyebrow">Serviço</div>${T(`${key}.title`, 'h2', ` id="${SEC_ID[key]}-title"`)}</div>
      <div>${T(`${key}.desc`, 'p')}<ul class="pill-list">${(s.tags || []).map((_, i) => `<li>${T(`${key}.tags.${i}`)}</li>`).join('')}</ul></div></header>`;
  };
  const secFoot = (key) => `<div class="service-foot">${T(`${key}.foot.text`, 'p')}${btn(`${key}.foot.btn`)}</div>`;

  const brandsWith = (flag) => (BA.site.modelos.brands || []).map((b, i) => ({ b, i })).filter((x) => x.b[flag]);

  /* ---------- seções ---------- */
  const R = {};

  R.servicos = () => {
    const s = BA.site.servicos; const show = BA.site.show || {};
    const cards = (s.cards || []).map((c, i) => ({ c, i })).filter((x) => show[x.c.key] !== false && SEC_ID[x.c.key]);
    return section('servicos', 'dark', `
      <div class="services-head">
        <div><div class="eyebrow">${T('servicos.eyebrow')}</div>${T('servicos.title', 'h2', ' id="servicos-title" class="section-title"')}</div>
        ${T('servicos.lead', 'p', ' class="lead"')}
      </div>
      <div class="services-grid">${cards.map((x, n) => `<a class="service-card" href="#${SEC_ID[x.c.key]}"><span class="arrow" aria-hidden="true">↗</span><span class="num">${String(n + 1).padStart(2, '0')}</span><span>${T(`servicos.cards.${x.i}.title`, 'h3')}${T(`servicos.cards.${x.i}.text`, 'p')}</span></a>`).join('')}</div>`);
  };

  R.identidade = () => {
    const s = BA.site.identidade;
    const cases = (s.cases || []).map((c, ci) => {
      const tiles = (c.tiles || []).map((t, ti) => {
        const fc = { contain: ' fit-contain', tight: ' fit-contain-tight' }[t.fit] || '';
        return ib(`tile tile-${esc(t.area || 'a')}${fc}`, `style="--tbg:${col(t.bg)}" data-image="${esc(src(t.src))}" aria-label="Ampliar: ${esc(t.alt)}"`, imgTag(t, `identidade.cases.${ci}.tiles.${ti}`));
      }).join('');
      return `<article class="brand-case" style="--cbg:${col(c.bg, '#121212')};--cink:${col(c.ink, '#ffffff')}">
        <div class="case-info"><div>${T(`identidade.cases.${ci}.tag`, 'p', ' class="tag"')}${T(`identidade.cases.${ci}.name`, 'h3')}${T(`identidade.cases.${ci}.desc`, 'p')}</div>
        <dl><dt>Escopo</dt><dd>${T(`identidade.cases.${ci}.scope`)}</dd><dt>Entrega</dt><dd>${T(`identidade.cases.${ci}.delivery`)}</dd></dl></div>
        <div class="mosaic">${tiles}${addTile(`identidade.cases.${ci}.tiles`)}</div></article>`;
    }).join('');
    return section('identidade', 'dark-2', `${secHead('identidade')}<div class="brand-cases">${cases}</div>${secFoot('identidade')}`);
  };

  R.icon = () => {
    const s = BA.site.icon;
    const tiles = (s.tiles || []).map((t, i) => `<div class="icon-tile${t.pad === 'none' ? ' full' : ''}" style="--tbg:${col(t.bg)}">${imgTag(t, `icon.tiles.${i}`)}</div>`).join('');
    const sc = s.scale || {};
    const fig = (n) => `<figure>${imgTag(sc.img ? { ...sc.img, w: n, h: n } : null, 'icon.scale.img', '', false).replace('<img ', `<img style="width:${n}px;height:${n}px" `)}${n} px</figure>`;
    return section('icon', 'light', `${secHead('icon')}
      <div class="icon-grid">${tiles}${addTile('icon.tiles', '+ Adicionar ícone')}</div>
      <div class="scale-test" aria-label="Teste de escala do ícone"><p><b>Teste de escala.</b> ${T('icon.scale.text')}</p>${[128, 64, 32, 16].map(fig).join('')}</div>
      ${secFoot('icon')}`);
  };

  R.logo = () => {
    const s = BA.site.logo;
    const tiles = (s.tiles || []).map((t, i) => `<figure class="logo-tile${t.size ? ` ${esc(t.size)}` : ''}" style="--tbg:${col(t.bg)}">${imgTag(t, `logo.tiles.${i}`)}<figcaption>${T(`logo.tiles.${i}.label`)}</figcaption></figure>`).join('');
    return section('logo', 'dark', `${secHead('logo')}<div class="logo-grid">${tiles}${addTile('logo.tiles', '+ Adicionar logo')}</div>${secFoot('logo')}`);
  };

  R.camisetas = () => {
    const s = BA.site.camisetas;
    const cards = brandsWith('tees').map(({ b, i }) => `<figure class="tee-card" style="--tbg:${col(b.bg)}38"><span class="badge-concept">${T('camisetas.badge')}</span>${teeSVG(b)}<figcaption>${T(`modelos.brands.${i}.plain`, 'h3')}${T(`modelos.brands.${i}.seg`, 'p')}</figcaption></figure>`).join('');
    const checks = (s.checks || []).map((c, i) => `<li><b>${T(`camisetas.checks.${i}.title`)}</b>${T(`camisetas.checks.${i}.text`)}</li>`).join('');
    return section('camisetas', 'light', `${secHead('camisetas')}<div class="tee-grid">${cards}</div><ul class="check-list">${checks}</ul>${secFoot('camisetas')}`);
  };

  R.adesivos = () => {
    const s = BA.site.adesivos;
    const list = brandsWith('stickers');
    const rot = [-8, 5, -4, 9, -6, 4, -7, 6];
    const rounds = list.map((x, n) => stickerRound(x.b, `--r:${rot[n % rot.length]}deg`)).join('');
    const pills = list.map((x, n) => stickerPill(x.b, `--r:${-rot[(n + 2) % rot.length] / 2}deg`)).join('');
    return section('adesivos', 'dark-2', `${secHead('adesivos')}
      <div class="sticker-board"><div class="sticker-grid">${rounds}${pills}</div>
      <div class="sticker-legend">${(s.legend || []).map((_, i) => T(`adesivos.legend.${i}`)).map((h) => h).join('')}</div></div>${secFoot('adesivos')}`);
  };

  R.social = () => {
    const s = BA.site.social; const c = s.carousel || {};
    const strip = (c.images || []).map((im, i) => ib('', `data-image="${esc(src(im.src))}" aria-label="Ampliar: ${esc(im.alt)}"`, imgTag(im, `social.carousel.images.${i}`))).join('');
    const feed = (s.feed || []).map((im, i) => ib('', `data-image="${esc(src(im.src))}" aria-label="Ampliar: ${esc(im.alt)}"`, `${imgTag(im, `social.feed.${i}`)}<span class="caption-chip">${T(`social.feed.${i}.chip`)}</span>`)).join('');
    return section('social', 'light', `${secHead('social')}
      <div class="social-layout">
        <article class="carousel-case">
          <div class="case-info"><div>${T('social.carousel.tag', 'p', ' class="tag"')}${T('social.carousel.name', 'h3')}${T('social.carousel.desc', 'p')}</div>
          <dl><dt>Escopo</dt><dd>${T('social.carousel.scope')}</dd><dt>Direção</dt><dd>${T('social.carousel.direction')}</dd></dl></div>
          <div class="carousel-strip" aria-label="Carrossel">${strip}${addTile('social.carousel.images', '+ Página')}</div>
        </article>
        <div><p class="eyebrow">${T('social.feedTitle')}</p><div class="masonry">${feed}${addTile('social.feed')}</div></div>
      </div>${secFoot('social')}`);
  };

  R.criativos = () => {
    const s = BA.site.criativos; const items = s.items || [];
    const clients = [...new Set(items.map((x) => x.client).filter(Boolean))];
    if (BA.filter !== 'all' && !clients.includes(BA.filter)) BA.filter = 'all';
    const chips = clients.length > 1 && !BA.edit
      ? `<div class="filters" role="group" aria-label="Filtrar por cliente"><button type="button" class="chip" data-filter="all" aria-pressed="${BA.filter === 'all'}">Todos</button>${clients.map((cl) => `<button type="button" class="chip" data-filter="${esc(cl)}" aria-pressed="${BA.filter === cl}">${esc(cl)}</button>`).join('')}</div>` : '';
    const grid = items.map((im, i) => ib(BA.filter !== 'all' && im.client !== BA.filter ? 'hide' : '', `data-client="${esc(im.client)}" data-image="${esc(src(im.src))}" aria-label="Ampliar: ${esc(im.alt)}"`, `${imgTag(im, `criativos.items.${i}`)}<span class="caption-chip">${T(`criativos.items.${i}.client`)}</span>`)).join('');
    return section('criativos', 'dark', `${secHead('criativos')}${chips}<div id="criativos-grid" class="masonry">${grid}${addTile('criativos.items')}</div>${secFoot('criativos')}`);
  };

  R.modelos = () => {
    const s = BA.site.modelos;
    const cards = brandsWith('models').map(({ b, i }, n) => {
      const f = fontOf(b);
      const nameHtml = BA.edit ? T(`modelos.brands.${i}.name`, 'span', '', true) : nl(b.name);
      return `<article class="model" style="--m-bg:${col(b.bg)};--m-ink:${col(b.ink)};--m-font:${esc(f.css)};--m-weight:${f.weight};--m-track:${f.track};--m-case:${b.upper ? 'uppercase' : 'none'}">
      <div class="model-stage"><span class="tag">${T('modelos.tag')} · Modelo ${String(n + 1).padStart(2, '0')}</span>
        <div class="model-logo">${markSVG(b, col(b.accent), col(b.ink), col(b.bg))}<div class="model-name">${nameHtml}<small>${T(`modelos.brands.${i}.sub`)}</small></div></div></div>
      <div class="model-body"><div>${T(`modelos.brands.${i}.plain`, 'h3')}<p>${T(`modelos.brands.${i}.seg`)} — ${T(`modelos.brands.${i}.desc`)}</p>
        <div class="swatches" aria-label="Paleta">${[b.bg, b.ink, b.accent].map((c) => `<span class="swatch"><i style="--c:${col(c)}"></i>${esc(col(c))}</span>`).join('')}</div></div>
        <div class="model-apps" aria-hidden="${BA.edit ? 'false' : 'true'}"><div class="model-post"><span>Post</span>${markSVG(b, col(b.accent), col(b.bg), col(b.ink))}<b>${T(`modelos.brands.${i}.post`)}</b></div>
          <div class="mini-tee">${teeSVG(b)}</div><div class="mini-sticker">${stickerRound(b, '', 'sticker-mini')}</div></div></div></article>`;
    }).join('');
    return section('modelos', 'light', `<div class="models-head"><div><div class="eyebrow">${T('modelos.eyebrow')}</div>${T('modelos.title', 'h2', ' id="modelos-title" class="section-title"')}</div>${T('modelos.lead', 'p', ' class="lead"')}</div>
      <div class="model-grid">${cards}</div>
      <div class="service-foot">${T('modelos.foot.text', 'p')}${btn('modelos.foot.btn')}</div>`);
  };

  R.planos = () => {
    const s = BA.site.planos;
    const plans = (s.plans || []).map((p, i) => `<article class="plan${p.featured ? ' featured' : ''}">${p.featured && (p.badge || BA.edit) ? `<span class="badge">${T(`planos.plans.${i}.badge`)}</span>` : ''}
      ${T(`planos.plans.${i}.name`, 'h3')}${T(`planos.plans.${i}.forwho`, 'p', ' class="plan-for"')}
      <div class="price">${T(`planos.plans.${i}.price`, 'strong')}${T(`planos.plans.${i}.period`)}</div>
      <ul>${(p.items || []).map((_, k) => `<li>${T(`planos.plans.${i}.items.${k}`)}</li>`).join('')}</ul>${btn(`planos.plans.${i}.btn`)}</article>`).join('');
    return section('planos', 'plans', `<div class="plans-head"><div class="eyebrow">${T('planos.eyebrow')}</div>${T('planos.title', 'h2', ' id="planos-title" class="section-title"')}${T('planos.lead', 'p', ' class="lead"')}</div>
      <div class="plan-grid">${plans}</div>
      <p class="plans-note">${T('planos.note')} ${btn('planos.noteBtn', ' link-btn')}</p>`);
  };

  R.processo = () => {
    const s = BA.site.processo;
    return section('processo', 'light process', `<div class="eyebrow">${T('processo.eyebrow')}</div>
      <img class="process-mark" src="assets/bunny-mark.webp" alt="" width="700" height="680" loading="lazy">
      <div class="process-wrap">${T('processo.title', 'h2', ' id="processo-title" class="section-title"')}
      <ol>${(s.steps || []).map((_, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div>${T(`processo.steps.${i}.title`, 'h3')}${T(`processo.steps.${i}.text`, 'p')}</div></li>`).join('')}</ol></div>`);
  };

  R.sobre = () => {
    const s = BA.site.sobre;
    return section('sobre', 'dark about', `<div class="eyebrow">${T('sobre.eyebrow')}</div>
      <div class="about-main">${T('sobre.title', 'h2', ' id="sobre-title" class="section-title"')}${T('sobre.text', 'p')}</div>
      <div class="about-aside">${(s.aside || []).map((_, i) => T(`sobre.aside.${i}`, 'p')).join('')}</div>`);
  };

  function contato() {
    const c = BA.site.contato;
    const list = (c.buttons || []).map((b, i) => ({ b, i, r: resolve(b) }));
    const pending = !BA.edit && !list.some((x) => x.r.ok);
    const btns = list.filter((x) => BA.edit || x.r.ok).map((x) => btn(`contato.buttons.${x.i}`)).join('');
    return `<section id="contato" class="contact reveal${BA.edit ? ' visible' : ''}${pending ? ' pending' : ''}" data-sec="contato" aria-labelledby="contact-title">
      ${BA.edit ? '<button type="button" class="edit-section" data-open="contato">✎ Editar esta seção</button>' : ''}
      <img class="contact-mark" src="assets/bunny-mark.webp" alt="" width="700" height="680" loading="lazy">
      ${T('contato.kicker', 'p', ' class="kicker"')}${T('contato.title', 'h2', ' id="contact-title"', true)}
      <div class="contact-actions">${btns}</div>${T('contato.pending', 'span', ' class="contact-status"')}</section>`;
  }

  /* ---------- página inteira ---------- */
  function build() {
    const S = BA.site; const show = S.show || {};
    const order = (S.order && S.order.length ? S.order : Object.keys(R)).filter((k) => R[k] && show[k] !== false);
    const hero = S.hero || {};
    const marq = (hero.marquee || []).map((m, i) => imgTag(m, `hero.marquee.${i}`, '', false)).join('');
    const nav = (S.nav || []).map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
    const year = new Date().getFullYear();
    return `
  <header class="site-header">
    <a class="brand" href="#topo" aria-label="Bunny Arts, início">${imgTag(S.header.logo, 'header.logo', '', false)}</a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav id="menu" class="nav" aria-label="Navegação principal">${nav}${btn('header.cta', ' btn-small nav-cta')}</nav>
  </header>
  <main id="conteudo">
    <section id="topo" class="hero" aria-labelledby="hero-title">
      <div class="hero-inner">
        <p class="hero-kicker"><span></span> ${T('hero.kicker')}</p>
        <h1 id="hero-title">${T('hero.line1')}<br>${T('hero.line2', 'em')}</h1>
        <div class="hero-bottom">${T('hero.text', 'p')}<div class="hero-actions">${btn('hero.btn1')}${btn('hero.btn2')}</div></div>
      </div>
      <div class="marquee" aria-label="Prévia de trabalhos"><div class="marquee-track">${marq}${addTile('hero.marquee', '+ Foto')}</div></div>
      ${BA.edit ? '<button type="button" class="edit-section" data-open="hero">✎ Editar esta seção</button>' : ''}
    </section>
    ${order.map((k) => R[k]()).join('\n')}
    ${contato()}
  </main>
  <footer>
    <a class="brand" href="#topo" aria-label="Bunny Arts, voltar ao início">${imgTag(S.header.logo, 'header.logo', '', false)}</a>
    <p>${BA.edit ? T('footer.text') : esc(String((S.footer || {}).text || '').replace('{ano}', year))}</p>
    <a href="#topo">${T('footer.top')}</a>
  </footer>`;
  }

  function applyMeta() {
    const S = BA.site;
    document.title = (S.seo && S.seo.title) || 'Bunny Arts';
    let m = $('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = (S.seo && S.seo.description) || '';
    const t = S.theme || {};
    if (t.accent) document.documentElement.style.setProperty('--accent', col(t.accent, '#7600c4'));
    if (t.accentBright) document.documentElement.style.setProperty('--accent-bright', col(t.accentBright, '#a443e6'));
  }

  const PLAIN = (() => { try { const d = document.createElement('div'); d.contentEditable = 'plaintext-only'; return d.contentEditable === 'plaintext-only'; } catch (e) { return false; } })();

  let observer;
  function render() {
    const app = $('#app');
    if (!app) return;
    const y = window.scrollY;
    document.documentElement.classList.toggle('editing', !!BA.edit);
    app.innerHTML = build();
    applyMeta();
    if (BA.edit) {
      $$('[data-p]', app).forEach((el) => { el.contentEditable = PLAIN ? 'plaintext-only' : 'true'; el.spellcheck = true; });
    } else {
      const track = $('.marquee-track', app);
      if (track) [...track.children].forEach((el) => { const c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); c.alt = ''; track.appendChild(c); });
      if (observer) observer.disconnect();
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), { threshold: 0.05 });
        $$('.reveal', app).forEach((el) => observer.observe(el));
      } else $$('.reveal', app).forEach((el) => el.classList.add('visible'));
    }
    if (y) window.scrollTo({ top: y, behavior: 'instant' });
    document.dispatchEvent(new CustomEvent('ba:rendered'));
  }
  BA.render = render;

  /* ---------- interações (só no site público) ---------- */
  document.addEventListener('click', (e) => {
    if (BA.edit) return;
    const mb = e.target.closest('.menu-button');
    const nav = $('.nav');
    if (mb) { const open = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', String(open)); return; }
    if (nav && e.target.closest('.nav a')) { nav.classList.remove('open'); const b = $('.menu-button'); if (b) b.setAttribute('aria-expanded', 'false'); }
    const chip = e.target.closest('.chip');
    if (chip) {
      BA.filter = chip.dataset.filter;
      $$('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      $$('#criativos-grid .image-button').forEach((b) => b.classList.toggle('hide', BA.filter !== 'all' && b.dataset.client !== BA.filter));
      return;
    }
    const ibtn = e.target.closest('.image-button');
    if (ibtn && ibtn.dataset.image) {
      const lb = $('.lightbox'); if (!lb) return;
      const im = $('img', lb); im.src = ibtn.dataset.image; im.alt = ($('img', ibtn) || {}).alt || '';
      lb.showModal();
    }
  });
  document.addEventListener('click', (e) => {
    const lb = $('.lightbox');
    if (!lb) return;
    if (e.target === lb || e.target.closest('.lightbox-close')) lb.close();
  });
  window.addEventListener('scroll', () => { const h = $('.site-header'); if (h) h.classList.toggle('scrolled', window.scrollY > 40); }, { passive: true });

  /* ---------- editor (carregado só com #admin) ---------- */
  const wantsAdmin = () => /(^|[#&?])admin\b/.test(location.hash) || /[?&]admin\b/.test(location.search);
  function loadAdmin() {
    if (BA.adminLoading || BA.edit) return;
    BA.adminLoading = true;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'admin.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'admin.js';
    s.onerror = () => { BA.adminLoading = false; alert('Não foi possível carregar o editor (admin.js). Confira se o arquivo está na mesma pasta do index.html.'); };
    document.head.appendChild(s);
  }
  BA.loadAdmin = loadAdmin;
  window.addEventListener('hashchange', () => { if (wantsAdmin()) loadAdmin(); });

  function start() {
    render();
    if (wantsAdmin()) loadAdmin();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
