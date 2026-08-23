/* Jackson Ryder, Admin dashboard logic */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const isImageSource = (v) => /^data:image\//i.test(v || "") || /\.(jpg|jpeg|png|gif|webp)(?:[?#].*)?$/i.test(v || "");

/* ---------------- API ---------------- */
async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: opts.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : {},
    ...opts,
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
const GET = (u) => api(u);
const POST = (u, b) => api(u, { method: "POST", body: JSON.stringify(b) });
const PUT = (u, b) => api(u, { method: "PUT", body: JSON.stringify(b) });
const DEL = (u) => api(u, { method: "DELETE" });

/* ---------------- Toast ---------------- */
let toastTimer;
function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast " + type;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

/* ---------------- Auth ---------------- */
async function checkAuth() {
  try {
    const d = await GET("/api/admin/check");
    return d.authenticated;
  } catch { return false; }
}
function showApp(show) {
  $("#loginView").hidden = show;
  $("#appView").hidden = !show;
  if (show) {
    loadView(currentView);
  }
}

/* ---------------- Navigation ---------------- */
let currentView = "dashboard";
const VIEW_TITLES = {
  dashboard: "Dashboard", songs: "Songs / Music", videos: "Lyric Videos",
  songwriting: "Songwriting", projects: "Portfolio", testimonials: "Testimonials",
  enquiries: "Enquiries", settings: "Settings",
};

function loadView(view) {
  currentView = view;
  $("#viewTitle").textContent = VIEW_TITLES[view] || view;
  $$(".sidebar__nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $("#sidebar").classList.remove("open");
  const c = $("#viewContent");
  c.innerHTML = "";
  if (view === "dashboard") renderDashboard(c);
  else if (view === "songs") renderSongs(c);
  else if (view === "videos") renderVideos(c);
  else if (view === "songwriting") renderSongwriting(c);
  else if (view === "projects") renderProjects(c);
  else if (view === "testimonials") renderTestimonials(c);
  else if (view === "enquiries") renderEnquiries(c);
  else if (view === "settings") renderSettings(c);
}

/* =====================================================================
   Shared form helpers
   ===================================================================== */
function field(label, name, value, opts = {}) {
  const type = opts.type || "text";
  const required = opts.required ? "required" : "";
  let input = "";
  if (type === "textarea") input = `<textarea data-name="${name}" rows="${opts.rows || 3}" ${required}>${esc(value)}</textarea>`;
  else if (type === "select") {
    input = `<select data-name="${name}" ${required}>${(opts.options || []).map((o) => `<option value="${esc(o)}" ${o === value ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
  } else input = `<input type="text" data-name="${name}" value="${esc(value)}" ${required} />`;
  return `<div class="field"><label>${esc(label)}</label>${input}${opts.hint ? `<div class="hint">${esc(opts.hint)}</div>` : ""}</div>`;
}

function fileField(label, name, value, accept) {
  return `
  <div class="field">
    <label>${esc(label)}</label>
    <input type="text" data-name="${name}" value="${esc(value)}" placeholder="Upload a file or paste a URL" />
    <div class="file-pick" style="margin-top:8px">
      <button type="button" class="btn btn--ghost btn--sm" data-upload="${name}">Upload</button>
      <input type="file" data-file="${name}" accept="${accept}" hidden />
      <span class="file-pick__name" data-filename="${name}"></span>
    </div>
    <div class="url-preview" data-urlpreview="${name}">${value ? "✓ " + esc(value) : ""}</div>
    <img class="preview-img" data-preview="${name}" ${isImageSource(value) ? `src="${esc(value)}"` : ""} ${isImageSource(value) ? "" : "hidden"} />
  </div>`;
}

function wireUploads(root) {
  $$("[data-upload]", root).forEach((btn) => {
    const name = btn.dataset.upload;
    btn.addEventListener("click", () => $(`[data-file="${name}"]`, root).click());
  });
  $$("[data-file]", root).forEach((input) => {
    const name = input.dataset.file;
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      $(`[data-filename="${name}"]`, root).textContent = "Uploading…";
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");
        const urlInput = $(`[data-name="${name}"]`, root);
        urlInput.value = data.url;
        $(`[data-urlpreview="${name}"]`, root).textContent = "✓ " + data.url;
        const img = $(`[data-preview="${name}"]`, root);
        if (img && isImageSource(data.url)) { img.src = data.url; img.hidden = false; }
        $(`[data-filename="${name}"]`, root).textContent = file.name;
        toast("File uploaded.");
      } catch (e) {
        $(`[data-filename="${name}"]`, root).textContent = "";
        toast(e.message, "err");
      }
    });
  });
}

function collectForm(root) {
  const out = {};
  $$("[data-name]", root).forEach((el) => { out[el.dataset.name] = el.value.trim(); });
  return out;
}

/* ---------------- Modal ---------------- */
function openModal(title, bodyHTML) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;
  $("#modal").hidden = false;
  wireUploads($("#modalBody"));
}
function closeModal() { $("#modal").hidden = true; }

/* =====================================================================
   DASHBOARD
   ===================================================================== */
async function renderDashboard(c) {
  const [songs, videos, sw, projects, testimonials, enq] = await Promise.all([
    GET("/api/admin/songs"), GET("/api/admin/videos"), GET("/api/admin/songwriting"),
    GET("/api/admin/projects"), GET("/api/admin/testimonials"), GET("/api/admin/enquiries"),
  ]);
  const newEnq = enq.filter((e) => e.status === "new").length;
  c.innerHTML = `
    <div class="stats">
      <div class="stat"><div class="stat__num">${songs.length}</div><div class="stat__label">Songs</div></div>
      <div class="stat"><div class="stat__num">${videos.length}</div><div class="stat__label">Lyric Videos</div></div>
      <div class="stat"><div class="stat__num">${sw.length}</div><div class="stat__label">Songwriting</div></div>
      <div class="stat"><div class="stat__num">${projects.length}</div><div class="stat__label">Projects</div></div>
      <div class="stat"><div class="stat__num">${testimonials.length}</div><div class="stat__label">Testimonials</div></div>
      <div class="stat"><div class="stat__num">${enq.length}</div><div class="stat__label">Enquiries</div></div>
    </div>
    <div class="panel">
      <div class="panel__head"><h3>Recent Enquiries</h3><button class="btn btn--ghost btn--sm" onclick="location.hash='#enquiries';document.querySelector('[data-view=enquiries]').click()">View all</button></div>
      <div class="panel__body">
        ${enq.length ? enq.slice(0, 5).map(enqRow).join("") : '<p style="color:var(--muted)">No enquiries yet.</p>'}
      </div>
    </div>`;
}

function enqRow(e) {
  return `
  <div class="list-row ${e.status === "read" ? "enquiry--read" : ""}">
    <div class="list-row__main">
      <div class="list-row__title">${esc(e.name)}, ${esc(e.service || "General")}</div>
      <div class="list-row__sub">${esc(e.email)} · ${esc(e.subject)} · ${esc(e.created_at)}</div>
    </div>
    <div class="list-row__actions">
      <button class="btn btn--ghost btn--sm" data-enq-view="${e.id}">View</button>
    </div>
  </div>`;
}

/* =====================================================================
   GENERIC LIST + FORM (for songs/videos/songwriting/projects)
   ===================================================================== */
function listRowHTML(item, thumb, title, sub, id) {
  return `
  <div class="list-row">
    ${thumb ? `<img class="list-row__thumb" src="${esc(thumb)}" alt="" onerror="this.style.visibility='hidden'" />` : `<div class="list-row__thumb"></div>`}
    <div class="list-row__main">
      <div class="list-row__title">${esc(title)}</div>
      <div class="list-row__sub">${esc(sub || "")}</div>
    </div>
    <div class="list-row__actions">
      <button class="btn btn--ghost btn--sm" data-edit="${id}">Edit</button>
      <button class="btn btn--danger btn--sm" data-del="${id}">Delete</button>
    </div>
  </div>`;
}

function bindRowActions(root, key, loadFn) {
  $$("[data-edit]", root).forEach((b) => b.addEventListener("click", () => openForm(key, b.dataset.edit)));
  $$("[data-del]", root).forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    await DEL(`/api/admin/${key}/${b.dataset.del}`);
    toast("Deleted.");
    loadFn();
  }));
}

/* ---------------- SONGS ---------------- */
async function renderSongs(c) {
  const items = await GET("/api/admin/songs");
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>All Songs (${items.length})</h3>
      <button class="btn btn--primary" data-add>+ Add Song</button></div>
    <div class="panel__body">${items.map((s) => listRowHTML(s, s.cover, s.title, `${s.artist} · ${s.genre || ""}`, s.id)).join("") || '<p style="color:var(--muted)">No songs yet.</p>'}</div></div>`;
  $("[data-add]", c).addEventListener("click", () => openForm("songs"));
  bindRowActions(c, "songs", () => renderSongs(c));
}

function songForm(s = {}) {
  return `
    <div class="field-row">
      ${field("Title *", "title", s.title, { required: true })}
      ${field("Artist", "artist", s.artist || "Jackson Ryder")}
    </div>
    <div class="field-row">
      ${field("Genre", "genre", s.genre)}
      ${field("Release Date", "release_date", s.release_date, { hint: "e.g. 2026" })}
    </div>
    ${field("Description", "description", s.description, { type: "textarea" })}
    ${fileField("Cover Artwork", "cover", s.cover, "image/*")}
    ${fileField("Audio File (.mp3)", "audio", s.audio, "audio/*")}
    ${field("YouTube ID (for Listen button)", "youtube_id", s.youtube_id, { hint: "The video ID, e.g. dQw4w9WgXcQ" })}
    <div class="field-row">
      ${field("Spotify Link", "spotify", s.spotify)}
      ${field("Apple Music Link", "apple_music", s.apple_music)}
    </div>
    <div class="field-row">
      ${field("YouTube Link", "youtube", s.youtube)}
      ${field("Audiomack Link", "audiomack", s.audiomack)}
    </div>`;
}

/* ---------------- VIDEOS ---------------- */
async function renderVideos(c) {
  const items = await GET("/api/admin/videos");
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>Lyric Videos (${items.length})</h3>
      <button class="btn btn--primary" data-add>+ Add Video</button></div>
    <div class="panel__body">${items.map((v) => listRowHTML(v, v.thumbnail, v.title, v.song_title, v.id)).join("") || '<p style="color:var(--muted)">No videos yet.</p>'}</div></div>`;
  $("[data-add]", c).addEventListener("click", () => openForm("videos"));
  bindRowActions(c, "videos", () => renderVideos(c));
}

function videoForm(v = {}) {
  return `
    ${field("Title *", "title", v.title, { required: true })}
    <div class="field-row">
      ${field("Song Title", "song_title", v.song_title)}
      ${field("Release Date", "release_date", v.release_date)}
    </div>
    ${field("Description", "description", v.description, { type: "textarea" })}
    ${fileField("Thumbnail", "thumbnail", v.thumbnail, "image/*")}
    ${field("Video URL (YouTube / Vimeo)", "video_url", v.video_url, { hint: "Any YouTube or Vimeo watch/embed link." })}
    `;
}

/* ---------------- SONGWRITING ---------------- */
async function renderSongwriting(c) {
  const items = await GET("/api/admin/songwriting");
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>Songwriting Projects (${items.length})</h3>
      <button class="btn btn--primary" data-add>+ Add Project</button></div>
    <div class="panel__body">${items.map((s) => listRowHTML(s, null, s.title, s.genre, s.id)).join("") || '<p style="color:var(--muted)">No projects yet.</p>'}</div></div>`;
  $("[data-add]", c).addEventListener("click", () => openForm("songwriting"));
  bindRowActions(c, "songwriting", () => renderSongwriting(c));
}

function songwritingForm(s = {}) {
  return `
    <div class="field-row">
      ${field("Title *", "title", s.title, { required: true })}
      ${field("Genre", "genre", s.genre)}
    </div>
    ${field("Description", "description", s.description, { type: "textarea" })}
    ${field("Lyrics Excerpt", "lyrics_excerpt", s.lyrics_excerpt, { type: "textarea", rows: 4, hint: "A short excerpt shown on the card." })}
    ${fileField("Demo Audio (.mp3)", "audio", s.audio, "audio/*")}`;
}

/* ---------------- PROJECTS ---------------- */
async function renderProjects(c) {
  const items = await GET("/api/admin/projects");
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>Portfolio Projects (${items.length})</h3>
      <button class="btn btn--primary" data-add>+ Add Project</button></div>
    <div class="panel__body">${items.map((p) => listRowHTML(p, p.image, p.title, p.category, p.id)).join("") || '<p style="color:var(--muted)">No projects yet.</p>'}</div></div>`;
  $("[data-add]", c).addEventListener("click", () => openForm("projects"));
  bindRowActions(c, "projects", () => renderProjects(c));
}

function projectForm(p = {}) {
  let projectDetails = p.details;
  if (typeof projectDetails === "string") {
    try { projectDetails = JSON.parse(projectDetails); }
    catch { projectDetails = projectDetails.split("\n").filter(Boolean); }
  }
  const details = (Array.isArray(projectDetails) ? projectDetails : []).join("\n");
  return `
    <div class="field-row">
      ${field("Title *", "title", p.title, { required: true })}
      ${field("Year", "year", p.year)}
    </div>
    <div class="field-row">
      ${field("Category", "category", p.category || "music", { type: "select", options: ["music", "songwriting", "production", "lyric-video"] })}
      ${field("Media Type", "media_type", p.media_type || "image", { type: "select", options: ["image", "video"] })}
    </div>
    ${field("Description", "description", p.description, { type: "textarea" })}
    ${fileField("Image", "image", p.image, "image/*")}
    ${field("Media URL (if video)", "media_url", p.media_url, { hint: "YouTube/Vimeo link if media type is video." })}
    ${field("Project Details", "details", details, { type: "textarea", rows: 3, hint: "One detail per line." })}
    `;
}

/* ---------------- TESTIMONIALS ---------------- */
async function renderTestimonials(c) {
  const items = await GET("/api/admin/testimonials");
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>Testimonials (${items.length})</h3>
      <button class="btn btn--primary" data-add>+ Add Testimonial</button></div>
    <div class="panel__body">${items.map((t) => listRowHTML(t, t.image, "Testimonial Screenshot", "Click Edit to replace the image", t.id)).join("") || '<p style="color:var(--muted)">No testimonial screenshots yet. Click “Add Testimonial” to upload one.</p>'}</div></div>`;
  $("[data-add]", c).addEventListener("click", () => openForm("testimonials"));
  bindRowActions(c, "testimonials", () => renderTestimonials(c));
}

function testimonialForm(t = {}) {
  return `
    ${fileField("Testimonial Screenshot *", "image", t.image, "image/*")}
    <p style="color:var(--muted);font-size:0.85rem;margin-top:-4px">Upload a clear JPG, PNG, or WebP screenshot. Visitors can click it to view the full-size image.</p>`;
}

/* ---------------- OPEN FORM / SAVE ---------------- */
const FORM_BUILDERS = {
  songs: songForm, videos: videoForm, songwriting: songwritingForm,
  projects: projectForm, testimonials: testimonialForm,
};

async function openForm(key, id) {
  let data = {};
  if (id) {
    const all = await GET(`/api/admin/${key}`);
    data = all.find((x) => String(x.id) === String(id)) || {};
  }
  // map camelCase public fields back to form's snake_case expectations
  if (key === "songs" && id) data = { ...data, release_date: data.release_date, youtube_id: data.youtube_id, apple_music: data.apple_music };
  const title = id ? "Edit" : "Add New";
  openModal(title, `
    <form id="entityForm">${FORM_BUILDERS[key](data)}</form>
    <button class="btn btn--primary btn--block" id="saveBtn" style="margin-top:8px">Save</button>`);
  $("#saveBtn").addEventListener("click", async () => {
    const body = collectForm($("#entityForm"));
    try {
      if (id) await PUT(`/api/admin/${key}/${id}`, body);
      else await POST(`/api/admin/${key}`, body);
      closeModal();
      toast("Saved.");
      loadView(key);
    } catch (e) { toast(e.message, "err"); }
  });
}

/* =====================================================================
   ENQUIRIES
   ===================================================================== */
async function renderEnquiries(c) {
  const items = await GET("/api/admin/enquiries");
  $("#enqBadge").hidden = true;
  const newCount = items.filter((e) => e.status === "new").length;
  $("#enqBadge").hidden = newCount === 0;
  $("#enqBadge").textContent = newCount;

  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>Enquiries (${items.length})</h3></div>
    <div class="panel__body">
      ${items.length ? items.map((e) => `
      <div class="list-row ${e.status === "read" ? "enquiry--read" : ""}">
        <div class="list-row__main">
          <div class="list-row__title">${e.status === "new" ? "● " : ""}${esc(e.name)} <span style="color:var(--accent-2);font-weight:500"> ${esc(e.service)}</span></div>
          <div class="list-row__sub">${esc(e.email)}${e.phone ? " · " + esc(e.phone) : ""} · ${esc(e.created_at)}</div>
        </div>
        <div class="list-row__actions">
          <button class="btn btn--ghost btn--sm" data-view="${e.id}">View</button>
          <button class="btn btn--ghost btn--sm" data-toggle="${e.id}">${e.status === "new" ? "Mark read" : "Mark new"}</button>
          <button class="btn btn--danger btn--sm" data-del="${e.id}">Delete</button>
        </div>
      </div>`).join("") : '<p style="color:var(--muted)">No enquiries yet.</p>'}
    </div></div>`;

  $$("[data-view]", c).forEach((b) => b.addEventListener("click", () => {
    const e = items.find((x) => String(x.id) === b.dataset.view);
    openModal("Enquiry", `
      <div class="enquiry">
        <div class="enquiry__meta">
          <span><strong>${esc(e.name)}</strong></span>
          <span>${esc(e.email)}</span>
          <span>${esc(e.phone || "")}</span>
          <span>${esc(e.service)}</span>
          <span>${esc(e.created_at)}</span>
        </div>
        <p style="margin-bottom:10px"><strong>Subject:</strong> ${esc(e.subject)}</p>
        <div class="enquiry__msg">${esc(e.message)}</div>
        <a class="btn btn--primary btn--block" style="margin-top:16px" href="mailto:${esc(e.email)}?subject=Re: ${encodeURIComponent(e.subject)}">Reply by Email</a>
      </div>`);
  }));
  $$("[data-toggle]", c).forEach((b) => b.addEventListener("click", async () => {
    const e = items.find((x) => String(x.id) === b.dataset.toggle);
    await api(`/api/admin/enquiries/${e.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: e.status === "new" ? "read" : "new" }) });
    renderEnquiries(c);
  }));
  $$("[data-del]", c).forEach((b) => b.addEventListener("click", async () => {
    if (!confirm("Delete this enquiry?")) return;
    await DEL(`/api/admin/enquiries/${b.dataset.del}`);
    toast("Deleted.");
    renderEnquiries(c);
  }));
}

/* =====================================================================
   SETTINGS
   ===================================================================== */
async function renderSettings(c) {
  const s = await GET("/api/admin/settings");
  const about = s.about || {};
  const social = s.social || {};
  c.innerHTML = `
    <div class="panel"><div class="panel__head"><h3>About / Bio</h3></div><div class="panel__body" id="aboutForm"></div></div>
    <div class="panel"><div class="panel__head"><h3>Social Media Links</h3></div><div class="panel__body" id="socialForm"></div></div>
    <div class="panel"><div class="panel__head"><h3>Admin Password</h3></div>
      <div class="panel__body"><p style="color:var(--muted);font-size:0.9rem">Change the password by setting the <code>ADMIN_PASSWORD</code> environment variable on your host (see README).</p></div></div>`;

  const aboutForm = $("#aboutForm");
  aboutForm.innerHTML = `
    <form>
      ${fileField("Profile Photo", "photo", about.photo, "image/*")}
      ${field("Heading", "heading", about.heading || "The Artist Behind the Music")}
      ${field("Intro", "intro", about.intro, { type: "textarea", rows: 2 })}
      ${field("Biography", "bio", (about.bio || []).join("\n\n"), { type: "textarea", rows: 5, hint: "Separate paragraphs with a blank line." })}
      ${(about.points || []).map((pt, i) => `
        <div class="field-row">
          ${field("Label " + (i + 1), "point_" + i + "_label", pt.label)}
          ${field("Text " + (i + 1), "point_" + i + "_text", pt.text)}
        </div>`).join("")}
    </form>
    <button class="btn btn--primary btn--block" id="saveAbout">Save About</button>`;
  wireUploads(aboutForm);
  $("#saveAbout").addEventListener("click", async () => {
    const vals = collectForm(aboutForm);
    const points = [0, 1, 2].map((i) => ({ label: vals["point_" + i + "_label"] || "", text: vals["point_" + i + "_text"] || "" })).filter((p) => p.label);
    const body = {
      about: {
        photo: vals.photo || about.photo,
        heading: vals.heading || "The Artist Behind the Music",
        intro: vals.intro || "",
        bio: (vals.bio || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
        points,
      },
    };
    await PUT("/api/admin/settings", body);
    toast("About saved.");
  });

  const socialForm = $("#socialForm");
  const socialKeys = [["youtube", "YouTube"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["facebook", "Facebook"], ["spotify", "Spotify"], ["appleMusic", "Apple Music"], ["soundcloud", "SoundCloud"], ["audiomack", "Audiomack"]];
  socialForm.innerHTML = `<form>${socialKeys.map(([k, label]) => field(label, "s_" + k, social[k] || "")).join("")}</form>
    <button class="btn btn--primary btn--block" id="saveSocial">Save Social Links</button>`;
  $("#saveSocial").addEventListener("click", async () => {
    const vals = collectForm(socialForm);
    const social = {};
    socialKeys.forEach(([k]) => (social[k] = vals["s_" + k] || "#"));
    await PUT("/api/admin/settings", { social });
    toast("Social links saved.");
  });
}

/* =====================================================================
   Boot
   ===================================================================== */
async function boot() {
  const authed = await checkAuth();
  showApp(authed);
  if (authed) updateEnqBadge();
}
async function updateEnqBadge() {
  try {
    const enq = await GET("/api/admin/enquiries");
    const n = enq.filter((e) => e.status === "new").length;
    $("#enqBadge").hidden = n === 0;
    $("#enqBadge").textContent = n;
  } catch {}
}

/* listeners */
$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const note = $("#loginNote");
  note.textContent = "";
  note.className = "login__note";
  try {
    await POST("/api/admin/login", { user: $("#loginUser").value.trim(), password: $("#loginPass").value });
    showApp(true);
  } catch (err) {
    note.textContent = err.message;
    note.className = "login__note error";
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await POST("/api/admin/logout", {});
  location.reload();
});

$$(".sidebar__nav button").forEach((b) => b.addEventListener("click", () => loadView(b.dataset.view)));
$("#mobileMenuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

$$("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
$("#modal").addEventListener("click", (e) => { if (e.target === $("#modal")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

boot();
