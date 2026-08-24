/* =====================================================================
   JACKSON RYDER, SITE ENGINE
   Renders every section from the data in content.js and wires up all
   interactions (nav, modals, filters, players, contact form).
   ===================================================================== */

/* ---------------------------------------------------------------------
   SVG ICONS
   --------------------------------------------------------------------- */
const S = (inner, vb = "0 0 24 24") =>
  `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  /* stroke / UI icons */
  mic: S('<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),
  pen: S('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
  sliders: S('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'),
  film: S('<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>'),
  waveform: S('<path d="M2 12h2"/><path d="M6 8v8"/><path d="M10 5v14"/><path d="M14 9v6"/><path d="M18 6v12"/><path d="M22 12h-2"/>'),
  layers: S('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'),
  target: S('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  compass: S('<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
  email: S('<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/>'),
  pin: S('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  play: S('<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>'),
  quote: S('<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .5-1 2z"/>', '0 0 12 24'),

  /* brand icons (fill-based) */
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.55 12 3.55 12 3.55s-7.51 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.87.5 9.38.5 9.38.5s7.51 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/></svg>',
  spotify: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.31c-.22.36-.68.47-1.04.25-2.85-1.74-6.44-2.14-10.66-1.17-.41.09-.82-.16-.91-.58-.09-.41.16-.82.58-.91 4.61-1.05 8.57-.6 11.72 1.33.36.22.47.68.25 1.04zm1.47-3.28c-.27.45-.85.6-1.3.33-3.26-2-8.23-2.58-12.08-1.41-.51.15-1.05-.14-1.2-.65-.15-.51.14-1.05.65-1.2 4.4-1.34 9.86-.69 13.55 1.58.45.27.6.85.33 1.3zm.13-3.41C15.28 8.52 8.86 8.36 5.18 9.48c-.61.19-1.26-.16-1.45-.77-.19-.61.16-1.26.77-1.45 4.24-1.29 11.3-1.04 16.1 2.27.55.3.75.99.45 1.54-.3.55-.99.75-1.54.45z"/></svg>',
  appleMusic: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>',
  soundcloud: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1.18 12.42l.8 4.26c.07.38.5.38.57 0l.8-4.26c.03-.15-.1-.3-.25-.3H1.43c-.15 0-.28.15-.25.3zm1.97-.44l.64 4.7c.05.38.47.38.53 0l.64-4.7c.04-.17-.09-.32-.26-.32H3.42c-.17 0-.3.15-.27.32zm1.97-.43l.6 5.1c.04.38.48.38.52 0l.6-5.1c.04-.19-.09-.36-.26-.36H5.37c-.16 0-.29.17-.25.36zm2.05-.46l.48 5.55c.03.36.44.36.47 0l.48-5.55c.02-.19-.11-.37-.25-.37H7.41c-.14 0-.26.18-.24.37zm1.92-.31l.43 5.85c.02.35.42.35.44 0l.43-5.85c.02-.2-.11-.37-.23-.37H9.32c-.12 0-.24.17-.22.37zM20.03 9.5c-.15 0-.3.01-.44.03a4.2 4.2 0 0 0-3.52-2.7 4.2 4.2 0 0 0-4.21 4.03l-.07 1.14c0 .2-.06.4-.14.57-.06.12-.06.26 0 .38.02.05.06.09.12.11 1.57.3 3.5 1.06 3.57 1.07a.2.2 0 0 0 .22-.24l-.15-1.08c0-.07.05-.14.12-.14h.86c.06 0 .13.07.12.14l-.12 1.04c-.01.12.06.24.18.24h1.18c.12 0 .24-.06.25-.19l.07-.52c.02-.16.07-.3.07-.46 0-1.76-1.1-3.26-2.65-3.26z"/></svg>',
  audiomack: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2.5 6.5v7l6-3.5-6-3.5z"/></svg>',
};

/* ---------------------------------------------------------------------
   Small utilities
   --------------------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const isReal = (url) => !!url && url !== "#" && url.trim() !== "";

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------------
   Video URL → embed URL (YouTube / Vimeo / passthrough)
   --------------------------------------------------------------------- */
function toEmbedUrl(url) {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,20})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
  return url;
}

/* ---------------------------------------------------------------------
   SOCIAL LINKS
   --------------------------------------------------------------------- */
const SOCIAL_ORDER = [
  ["youtube", "YouTube"],
  ["instagram", "Instagram"],
  ["tiktok", "TikTok"],
  ["facebook", "Facebook"],
  ["spotify", "Spotify"],
  ["appleMusic", "Apple Music"],
  ["soundcloud", "SoundCloud"],
  ["audiomack", "Audiomack"],
];

function renderSocial(container) {
  const links = SITE.social;
  container.innerHTML = SOCIAL_ORDER.filter(([key]) => isReal(links[key]))
    .map(
      ([key, label]) =>
        `<a href="${escapeHtml(links[key])}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${ICONS[key]}</a>`
    )
    .join("");
}

/* ---------------------------------------------------------------------
   RENDER: About
   --------------------------------------------------------------------- */
function renderAbout() {
  $("#about-heading").textContent = ABOUT.heading;
  $("#about-intro").textContent = ABOUT.intro;
  $("#about-bio").innerHTML = ABOUT.bio.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  $("#about-points").innerHTML = ABOUT.points
    .map(
      (pt) => `
      <div class="point">
        <dt>${escapeHtml(pt.label)}</dt>
        <dd>${escapeHtml(pt.text)}</dd>
      </div>`
    )
    .join("");
  const img = $(".about__frame img");
  if (img) { img.src = ABOUT.photo; img.alt = ABOUT.photoAlt || `${SITE.name} portrait`; }
}

/* ---------------------------------------------------------------------
   RENDER: Music
   --------------------------------------------------------------------- */
function renderMusic() {
  const grid = $("#musicGrid");
  if (!SONGS.length) {
    grid.innerHTML = `<div class="section-empty"><p class="section-empty__eyebrow">New Music Coming Soon</p><p class="section-empty__text">Songs will appear here as they are released.</p></div>`;
    return;
  }
  grid.innerHTML = SONGS.map((song, i) => {
    const player = isReal(song.audioUrl)
      ? `<audio class="audio-player" controls controlsList="nodownload noplaybackrate" disablePictureInPicture preload="none" src="${escapeHtml(song.audioUrl)}" oncontextmenu="return false"></audio>`
      : `<div class="audio-placeholder">♪ Add an .mp3 link to enable the player</div>`;

    const platformLinks = [
      ["spotify", "Spotify"],
      ["appleMusic", "Apple Music"],
      ["youtube", "YouTube"],
      ["audiomack", "Audiomack"],
    ]
      .filter(([key]) => isReal(song.links && song.links[key]))
      .map(
        ([key, label]) =>
          `<a href="${escapeHtml(song.links[key])}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${ICONS[key]}</a>`
      )
      .join("");

    let listenBtn = "";
    if (isReal(song.youtubeId)) {
      listenBtn = `<button class="btn btn--primary music-card__listen" data-video="${escapeHtml(`https://youtu.be/${song.youtubeId}`)}">Listen Now</button>`;
    } else {
      const fallback =
        ["spotify", "appleMusic", "youtube", "audiomack"]
          .map((k) => song.links && song.links[k])
          .find((u) => isReal(u));
      if (isReal(fallback)) {
        listenBtn = `<a class="btn btn--primary music-card__listen" href="${escapeHtml(fallback)}" target="_blank" rel="noopener noreferrer">Listen Now</a>`;
      }
    }

    return `
      <article class="music-card reveal">
        <div class="music-card__cover">
          <img src="${escapeHtml(song.cover)}" alt="${escapeHtml(song.title)}, ${escapeHtml(song.artist)} cover art" loading="lazy" />
        </div>
        <div class="music-card__body">
          <div class="music-card__meta">
            <span class="music-card__genre">${escapeHtml(song.genre || "")}</span>
            <span>${escapeHtml(song.releaseDate || "")}</span>
          </div>
          <h3 class="music-card__title">${escapeHtml(song.title)}</h3>
          <p class="music-card__artist">${escapeHtml(song.artist)}</p>
          <p class="music-card__desc">${escapeHtml(song.description || "")}</p>
          <div class="music-card__player">${player}</div>
          ${
            platformLinks
              ? `<div class="music-card__links">${platformLinks}</div>`
              : ""
          }
          ${listenBtn}
        </div>
      </article>`;
  }).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Songwriting
   --------------------------------------------------------------------- */
function renderSongwriting() {
  if (!SONGWRITING_PROJECTS.length) {
    $("#songwritingGrid").innerHTML = `<div class="section-empty"><p class="section-empty__eyebrow">Songwriting</p><p class="section-empty__text">Songwriting projects will appear here.</p></div>`;
    return;
  }
  $("#songwritingGrid").innerHTML = SONGWRITING_PROJECTS.map(
    (p) => `
    <article class="song-card reveal">
      <div class="song-card__icon">${ICONS.pen}</div>
      <span class="song-card__genre">${escapeHtml(p.genre || "")}</span>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description || "")}</p>
      <div class="song-card__lyrics">&ldquo;${escapeHtml(p.lyricsExcerpt || "")}&rdquo;</div>
    </article>`
  ).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Production
   --------------------------------------------------------------------- */
function renderProduction() {
  $("#productionGrid").innerHTML = PRODUCTION_SERVICES.map(
    (s) => `
    <article class="production-card reveal">
      <div class="production-card__icon">${ICONS[s.icon] || ICONS.waveform}</div>
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.description)}</p>
    </article>`
  ).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Lyric videos
   --------------------------------------------------------------------- */
function renderLyricVideos() {
  if (!LYRIC_VIDEOS.length) {
    $("#lyricVideosGrid").innerHTML = `<div class="section-empty"><p class="section-empty__eyebrow">Lyric Videos</p><p class="section-empty__text">Lyric videos will appear here as they are released.</p></div>`;
    return;
  }
  $("#lyricVideosGrid").innerHTML = LYRIC_VIDEOS.map((v) => {
    const hasVideo = isReal(v.videoUrl);
    return `
    <article class="video-card reveal">
      <div class="video-card__thumb" ${hasVideo ? `data-video="${escapeHtml(v.videoUrl)}"` : ""}>
        <img src="${escapeHtml(v.thumbnail)}" alt="${escapeHtml(v.title)} thumbnail" loading="lazy" />
        <div class="video-card__play">${ICONS.play}</div>
      </div>
      <div class="video-card__body">
        <span class="video-card__date">${escapeHtml(v.releaseDate || "")}</span>
        <h3>${escapeHtml(v.title)}</h3>
        <p class="video-card__song">${escapeHtml(v.songTitle || "")}</p>
        <p>${escapeHtml(v.description || "")}</p>
      </div>
    </article>`;
  }).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Portfolio
   --------------------------------------------------------------------- */
const CATEGORY_LABELS = {
  music: "Music",
  songwriting: "Songwriting",
  production: "Production",
  "lyric-video": "Lyric Video",
};

function renderPortfolio() {
  const grid = $("#portfolioGrid");
  const filters = $("#portfolioFilters");
  if (!PORTFOLIO_ITEMS.length) {
    if (filters) filters.style.display = "none";
    grid.innerHTML = `
      <div class="portfolio-empty">
        <p class="portfolio-empty__eyebrow">Portfolio</p>
        <p class="portfolio-empty__text">New projects will appear here soon.</p>
      </div>`;
    return;
  }
  if (filters) filters.style.display = "";
  grid.innerHTML = PORTFOLIO_ITEMS.map((p, i) => `
    <article class="portfolio-item reveal" data-category="${escapeHtml(p.category)}" data-index="${i}">
      <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}, ${CATEGORY_LABELS[p.category] || ""}" loading="lazy" />
      ${
        p.mediaType === "video"
          ? `<span class="portfolio-item__play">${ICONS.play}</span>`
          : ""
      }
      <div class="portfolio-item__overlay">
        <span class="portfolio-item__cat">${CATEGORY_LABELS[p.category] || p.category}</span>
        <span class="portfolio-item__title">${escapeHtml(p.title)}</span>
      </div>
    </article>`).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Services
   --------------------------------------------------------------------- */
function renderServices() {
  $("#servicesGrid").innerHTML = SERVICES.map(
    (s) => `
    <article class="service-card reveal">
      <div class="service-card__icon">${ICONS[s.icon] || ICONS.mic}</div>
      <h3>${escapeHtml(s.name)}</h3>
      <p class="service-card__tagline">${escapeHtml(s.tagline)}</p>
      <ul>${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
      <button class="btn btn--ghost" data-preselect="${escapeHtml(s.name)}">Enquire Now</button>
    </article>`
  ).join("");
}

/* ---------------------------------------------------------------------
   RENDER: Testimonials
   --------------------------------------------------------------------- */
function renderTestimonials() {
  const grid = $("#testimonialsGrid");
  if (!TESTIMONIALS.length) {
    grid.innerHTML = `<div class="section-empty"><p class="section-empty__eyebrow">Testimonials</p><p class="section-empty__text">Client testimonials will appear here soon.</p></div>`;
    return;
  }
  grid.innerHTML = TESTIMONIALS.map(
    (t, i) => `
    <article class="testimonial-card testimonial-card--image reveal">
      <img class="testimonial-card__image" src="${escapeHtml(t.image)}" alt="Client testimonial screenshot ${i + 1}" loading="lazy" />
    </article>`
  ).join("");
}

/* ---------------------------------------------------------------------
   NAVIGATION
   --------------------------------------------------------------------- */
function initNav() {
  const nav = $("#nav");
  const burger = $("#navBurger");
  const links = $("#navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  // close on outside click
  document.addEventListener("click", (e) => {
    if (
      links.classList.contains("is-open") &&
      !links.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------------------------------------------------------------------
   SCROLL REVEAL
   --------------------------------------------------------------------- */
function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((n) => io.observe(n));
}

/* ---------------------------------------------------------------------
   MODALS (video / project / legal)
   --------------------------------------------------------------------- */
function initModals() {
  const videoModal = $("#videoModal");
  const videoEmbed = $("#videoEmbed");
  const projectModal = $("#projectModal");
  const projectBody = $("#projectBody");
  const legalModal = $("#legalModal");
  const legalBody = $("#legalBody");

  function open(elNode) { elNode.classList.add("is-open"); document.body.style.overflow = "hidden"; }
  function close(elNode) { elNode.classList.remove("is-open"); document.body.style.overflow = ""; }

  // generic close handlers
  $$(".modal").forEach((m) => {
    $$("[data-close]", m).forEach((c) =>
      c.addEventListener("click", () => {
        close(m);
        if (m === videoModal) videoEmbed.innerHTML = "";
      })
    );
    m.addEventListener("click", (e) => {
      if (e.target === m) {
        close(m);
        if (m === videoModal) videoEmbed.innerHTML = "";
      }
    });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      $$(".modal.is-open").forEach((m) => close(m));
      videoEmbed.innerHTML = "";
    }
  });

  // video modal (delegated)
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-video]");
    if (!trigger) return;
    const embedUrl = toEmbedUrl(trigger.getAttribute("data-video"));
    if (!embedUrl) return;
    videoEmbed.innerHTML = `<iframe src="${escapeHtml(embedUrl)}" title="Video player" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe>`;
    open(videoModal);
  });

  // project modal (delegated)
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".portfolio-item");
    if (!item) return;
    const p = PORTFOLIO_ITEMS[Number(item.getAttribute("data-index"))];
    if (!p) return;

    const media =
      p.mediaType === "video" && isReal(p.mediaUrl)
        ? `<div class="modal__project__media"><iframe src="${escapeHtml(toEmbedUrl(p.mediaUrl))}" title="${escapeHtml(p.title)}" allow="autoplay; fullscreen; encrypted-media" allowfullscreen></iframe></div>`
        : `<div class="modal__project__media"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" /></div>`;

    projectBody.innerHTML = `
      ${media}
      <div class="modal__project__body">
        <span class="modal__project__cat">${CATEGORY_LABELS[p.category] || p.category}</span>
        <h3 class="modal__project__title">${escapeHtml(p.title)}</h3>
        <p class="modal__project__year">${escapeHtml(p.year || "")}</p>
        <p class="modal__project__desc">${escapeHtml(p.description || "")}</p>
        ${
          p.details && p.details.length
            ? `<div class="modal__project__details"><h4>Project Details</h4><ul>${p.details
                .map((d) => `<li>${escapeHtml(d)}</li>`)
                .join("")}</ul></div>`
            : ""
        }
      </div>`;
    open(projectModal);
  });


  // legal modal
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-legal]");
    if (!trigger) return;
    const type = trigger.getAttribute("data-legal");
    const content =
      type === "privacy" ? PRIVACY_TEXT : TERMS_TEXT;
    legalBody.innerHTML = `<h3>${type === "privacy" ? "Privacy Policy" : "Terms of Service"}</h3>${content}`;
    open(legalModal);
  });
}

const PRIVACY_TEXT = `
  <p>Your privacy matters. Information you submit through the contact form (name, email, phone and message) is used only to respond to your enquiry and is never sold or shared with third parties.</p>
  <p>This website may use basic, privacy-respecting analytics to understand how visitors use the site. No personally identifiable information is collected automatically.</p>
  <p>If you have any questions about how your data is handled, contact jacksonryder336@gmail.com.</p>`;

const TERMS_TEXT = `
  <p>By using this website you agree to use it lawfully and not to submit false, misleading or harmful information through its forms.</p>
  <p>All music, lyrics, artwork, videos and written content on this site are the property of Jackson Ryder unless otherwise stated, and may not be reproduced without permission.</p>
  <p>This website and its content are provided "as is" without warranties of any kind.</p>`;

/* ---------------------------------------------------------------------
   PORTFOLIO FILTERS
   --------------------------------------------------------------------- */
function initFilters() {
  const filters = $$("#portfolioFilters .filter");
  const items = $$("#portfolioGrid .portfolio-item");

  filters.forEach((f) =>
    f.addEventListener("click", () => {
      filters.forEach((x) => {
        x.classList.toggle("filter--active", x === f);
        x.setAttribute("aria-selected", x === f ? "true" : "false");
      });
      const cat = f.getAttribute("data-filter");
      items.forEach((item) => {
        const show = cat === "all" || item.getAttribute("data-category") === cat;
        item.style.display = show ? "" : "none";
      });
    })
  );
}

/* ---------------------------------------------------------------------
   SERVICE PRE-SELECT (Enquire Now → contact form)
   --------------------------------------------------------------------- */
function initPreselect() {
  $$("[data-preselect]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const service = $("#service");
      const val = btn.getAttribute("data-preselect");
      if (service && val) {
        service.value = val;
      }
      const target = document.querySelector("#contact");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    })
  );
}

/* ---------------------------------------------------------------------
   CONTACT FORM
   --------------------------------------------------------------------- */
function initContactForm() {
  const form = $("#contactForm");
  const note = $("#formNote");
  const submitBtn = $("#submitBtn");
  const btnLabel = submitBtn.querySelector(".btn__label");

  const setNote = (msg, type) => {
    note.textContent = msg;
    note.className = "contact__form-note " + (type || "");
  };

  function clearInvalid() {
    $$(".invalid", form).forEach((n) => n.classList.remove("invalid"));
  }

  function validate() {
    clearInvalid();
    const name = $("#name");
    const email = $("#email");
    const service = $("#service");
    const subject = $("#subject");
    const message = $("#message");
    let ok = true;

    const bad = (el) => {
      el.classList.add("invalid");
      ok = false;
    };

    if (!name.value.trim() || name.value.trim().length < 2) bad(name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) bad(email);
    if (!service.value) bad(service);
    if (!subject.value.trim() || subject.value.trim().length < 2) bad(subject);
    if (!message.value.trim() || message.value.trim().length < 10) bad(message);

    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      setNote("Please fill in the highlighted fields correctly.", "error");
      return;
    }

    const phoneNumber = $("#phone").value.trim();
    const countryCode = $("#countryCode").value;
    const payload = {
      name: $("#name").value.trim(),
      email: $("#email").value.trim(),
      phone: phoneNumber ? `${countryCode} ${phoneNumber.replace(/^\+/, "").trim()}` : "",
      service: $("#service").value,
      subject: $("#subject").value.trim(),
      message: $("#message").value.trim(),
      website: $("#website").value, // honeypot
    };

    submitBtn.disabled = true;
    btnLabel.textContent = "Sending...";
    setNote("");

    let sent = false;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        sent = true;
        btnLabel.textContent = "Sent ✓";
        setNote(
          "Thank you for reaching out to Jackson Ryder. Your enquiry has been received successfully. I will get back to you as soon as possible.",
          "success"
        );
        form.reset();
      } else {
        setNote(
          data.error || "Something went wrong. Please try again.",
          "error"
        );
      }
    } catch (err) {
      setNote("Network error, please check your connection and try again.", "error");
    } finally {
      if (sent) {
        setTimeout(() => {
          submitBtn.disabled = false;
          btnLabel.textContent = "Send Enquiry";
        }, 3000);
      } else {
        submitBtn.disabled = false;
        btnLabel.textContent = "Send Enquiry";
      }
    }
  });
}

/* ---------------------------------------------------------------------
   AUDIO DOWNLOAD DETERRENCE
   Browsers must receive audio data to play it, so no website can make a
   public track impossible to capture. These controls remove ordinary
   download options, right-click saving, and dragging from the player.
   --------------------------------------------------------------------- */
function initAudioProtection() {
  $$("audio.audio-player").forEach((audio) => {
    audio.setAttribute("controlsList", "nodownload noplaybackrate");
    audio.setAttribute("disablePictureInPicture", "");
    audio.addEventListener("contextmenu", (e) => e.preventDefault());
    audio.addEventListener("dragstart", (e) => e.preventDefault());
  });
}

/* ---------------------------------------------------------------------
   LOAD CONTENT FROM DATABASE (admin-managed), fall back to content.js
   --------------------------------------------------------------------- */
async function loadContent() {
  try {
    const res = await fetch("/api/content");
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data.songs) && data.songs.length) SONGS = data.songs;
    if (Array.isArray(data.videos) && data.videos.length) LYRIC_VIDEOS = data.videos;
    if (Array.isArray(data.songwriting) && data.songwriting.length) SONGWRITING_PROJECTS = data.songwriting;
    if (Array.isArray(data.projects)) PORTFOLIO_ITEMS = data.projects;
    if (Array.isArray(data.testimonials)) TESTIMONIALS = data.testimonials;

    if (data.settings) {
      if (data.settings.social) {
        SITE.social = Object.assign({}, SITE.social, data.settings.social);
      }
      if (data.settings.about) {
        const a = data.settings.about;
        ABOUT.photo = a.photo || ABOUT.photo;
        ABOUT.heading = a.heading || ABOUT.heading;
        ABOUT.intro = a.intro || ABOUT.intro;
        ABOUT.bio = Array.isArray(a.bio) && a.bio.length ? a.bio : ABOUT.bio;
        ABOUT.points = Array.isArray(a.points) && a.points.length ? a.points : ABOUT.points;
      }
    }
  } catch (e) {
    /* offline / static hosting, use content.js seed */
  }
}

/* ---------------------------------------------------------------------
   BOOT
   --------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  await loadContent();
  renderAbout();
  renderMusic();
  renderSongwriting();
  renderProduction();
  renderLyricVideos();
  renderPortfolio();
  renderServices();
  renderTestimonials();
  initAudioProtection();
  renderSocial($("#socialContact"));
  renderSocial($("#socialFooter"));

  initNav();
  initReveal();
  initModals();
  initFilters();
  initPreselect();
  initContactForm();
});
