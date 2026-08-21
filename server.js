/**
 * Jackson Ryder — Website server
 * Serves the site, powers the contact/enquiry form (with Gmail delivery),
 * and provides the admin dashboard + API for managing content.
 *
 * - Public:   /api/content, /api/contact, /api/health
 * - Admin:    /admin  (dashboard) + /api/admin/* (authenticated)
 *
 * Email is sent via Nodemailer. Configure credentials via environment
 * variables (see .env.example).
 */

require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const { db, getSettings } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

/* =====================================================================
   Setup
   ===================================================================== */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const UPLOAD_DIR = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* =====================================================================
   Auth (admin) — HMAC-signed cookie token
   ===================================================================== */
const SECRET = process.env.SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "jackson2026";
const TOKEN_TTL = 7 * 24 * 3600 * 1000; // 7 days

const sign = (v) => crypto.createHmac("sha256", SECRET).update(v).digest("hex");
function makeToken() {
  const payload = Buffer.from(JSON.stringify({ u: ADMIN_USER, exp: Date.now() + TOKEN_TTL })).toString("base64");
  return payload + "." + sign(payload);
}
function verifyToken(token) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return false;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64").toString());
    return d.u === ADMIN_USER && d.exp > Date.now();
  } catch { return false; }
}
function checkPassword(pw) {
  const a = Buffer.from(String(pw));
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
function getCookie(req, name) {
  const c = req.headers.cookie || "";
  const m = c.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? m[1] : null;
}
function requireAdmin(req, res, next) {
  if (verifyToken(getCookie(req, "jr_admin"))) return next();
  res.status(401).json({ success: false, error: "Not authenticated" });
}

/* =====================================================================
   File uploads (multer) — audio / video / images
   ===================================================================== */
const ALLOWED = /\.(mp3|wav|m4a|aac|flac|ogg|mp4|mov|webm|m4v|jpg|jpeg|png|gif|webp)$/i;
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _f, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
    },
  }),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB (video)
  fileFilter: (_req, file, cb) => {
    const ok = /^(image|audio|video)\//.test(file.mimetype) || ALLOWED.test(file.originalname);
    cb(null, ok);
  },
});

/* =====================================================================
   Rate limiting (in-memory, per IP)
   ===================================================================== */
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) { hits.set(ip, list); return true; }
  list.push(now);
  hits.set(ip, list);
  return false;
}

/* =====================================================================
   Email
   ===================================================================== */
function getTransporter() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com", port: 465, secure: true,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
  }
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

const VALID_SERVICES = new Set(["Singing", "Songwriting", "Music Production", "Lyric Video", "Collaboration", "Other"]);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

function validateBody(b) {
  const errors = [];
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const service = typeof b.service === "string" ? b.service.trim() : "";
  const subject = typeof b.subject === "string" ? b.subject.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  if (name.length < 2) errors.push("Please enter your full name.");
  if (name.length > 100) errors.push("Name is too long.");
  if (!isValidEmail(email)) errors.push("Please enter a valid email address.");
  if (email.length > 200) errors.push("Email is too long.");
  if (phone.length > 40) errors.push("Phone number is too long.");
  if (!VALID_SERVICES.has(service)) errors.push("Please choose a valid service.");
  if (subject.length < 2) errors.push("Please enter a subject.");
  if (subject.length > 150) errors.push("Subject is too long.");
  if (message.length < 10) errors.push("Please write a message (at least 10 characters).");
  if (message.length > 5000) errors.push("Message is too long.");
  return { errors, values: { name, email, phone, service, subject, message } };
}

/* =====================================================================
   Mappers (snake_case DB -> camelCase public shape)
   ===================================================================== */
const songPub = (r) => ({
  id: r.id, title: r.title, artist: r.artist, description: r.description,
  genre: r.genre, releaseDate: r.release_date, cover: r.cover, audioUrl: r.audio,
  youtubeId: r.youtube_id,
  links: { spotify: r.spotify, appleMusic: r.apple_music, youtube: r.youtube, audiomack: r.audiomack },
});
const videoPub = (r) => ({
  id: r.id, title: r.title, songTitle: r.song_title, description: r.description,
  releaseDate: r.release_date, thumbnail: r.thumbnail, videoUrl: r.video_url,
});
const swPub = (r) => ({
  id: r.id, title: r.title, genre: r.genre, description: r.description,
  lyricsExcerpt: r.lyrics_excerpt, audioUrl: r.audio,
});
const projPub = (r) => {
  let details = [];
  try { details = JSON.parse(r.details || "[]"); } catch {}
  return {
    id: r.id, title: r.title, category: r.category, description: r.description,
    image: r.image, mediaType: r.media_type, mediaUrl: r.media_url, year: r.year, details,
  };
};

/* =====================================================================
   PUBLIC API
   ===================================================================== */
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Jackson Ryder website" }));

app.get("/api/content", (_req, res) => {
  res.json({
    songs: db.prepare("SELECT * FROM songs ORDER BY id").all().map(songPub),
    videos: db.prepare("SELECT * FROM videos ORDER BY id").all().map(videoPub),
    songwriting: db.prepare("SELECT * FROM songwriting ORDER BY id").all().map(swPub),
    projects: db.prepare("SELECT * FROM projects ORDER BY id").all().map(projPub),
    settings: getSettings(),
  });
});

app.post("/api/contact", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").toString().split(",")[0].trim();
  if (isRateLimited(ip)) return res.status(429).json({ success: false, error: "Too many requests. Please try again later." });
  if (req.body && req.body.website && String(req.body.website).length > 0) return res.json({ success: true }); // honeypot

  const { errors, values } = validateBody(req.body || {});
  if (errors.length) return res.status(400).json({ success: false, error: errors.join(" ") });

  // Always store the enquiry in the database (admin dashboard).
  db.prepare("INSERT INTO enquiries (name, email, phone, service, subject, message) VALUES (?,?,?,?,?,?)")
    .run(values.name, values.email, values.phone, values.service, values.subject, values.message);

  const transporter = getTransporter();
  if (!transporter) {
    console.error("[contact] Email not configured. Enquiry saved to database only.");
    return res.status(500).json({
      success: false,
      error: "The enquiry system is not fully configured yet. Please contact the site owner.",
    });
  }

  const fromAddress = process.env.MAIL_FROM || (process.env.SMTP_USER || values.email);
  const toAddress = process.env.MAIL_TO || "jacksoonryder336@gmail.com";
  const submittedAt = new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "full", timeStyle: "short" });

  const htmlBody = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden">
    <div style="background:#0d0d0d;padding:24px;border-bottom:3px solid #d4a24e">
      <h2 style="color:#f5f5f5;margin:0;font-size:20px">New Website Enquiry</h2>
      <p style="color:#d4a24e;margin:6px 0 0;font-size:13px">Jackson Ryder &middot; Official Website</p>
    </div>
    <div style="padding:24px;background:#141414;color:#e8e8e8">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#9a9a9a;width:130px">Visitor Name</td><td style="padding:8px 0;font-weight:bold">${esc(values.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#9a9a9a">Email</td><td style="padding:8px 0"><a href="mailto:${esc(values.email)}" style="color:#d4a24e">${esc(values.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#9a9a9a">Phone</td><td style="padding:8px 0">${esc(values.phone || "—")}</td></tr>
        <tr><td style="padding:8px 0;color:#9a9a9a">Service</td><td style="padding:8px 0;font-weight:bold">${esc(values.service)}</td></tr>
        <tr><td style="padding:8px 0;color:#9a9a9a">Subject</td><td style="padding:8px 0">${esc(values.subject)}</td></tr>
        <tr><td style="padding:8px 0;color:#9a9a9a">Submitted</td><td style="padding:8px 0">${esc(submittedAt)}</td></tr>
      </table>
      <div style="margin-top:16px;background:#0d0d0d;border-radius:8px;padding:16px">
        <p style="color:#9a9a9a;margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px">Message</p>
        <p style="margin:0;white-space:pre-wrap;line-height:1.6">${esc(values.message)}</p>
      </div>
    </div>
  </div>`;

  const textBody = [
    "New Website Enquiry | Jackson Ryder",
    "--------------------------------------",
    `Visitor Name : ${values.name}`,
    `Email        : ${values.email}`,
    `Phone        : ${values.phone || "—"}`,
    `Service      : ${values.service}`,
    `Subject      : ${values.subject}`,
    `Submitted    : ${submittedAt}`,
    "", "Message", "--------------------------------------", values.message,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: `"Jackson Ryder Website" <${fromAddress}>`,
      to: toAddress, replyTo: values.email,
      subject: "New Website Enquiry | Jackson Ryder",
      text: textBody, html: htmlBody,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("[contact] Email failed:", err.message);
    return res.status(502).json({ success: false, error: "We couldn't send your enquiry right now. Please try again in a moment." });
  }
});

/* =====================================================================
   ADMIN AUTH
   ===================================================================== */
app.post("/api/admin/login", (req, res) => {
  const { user, password } = req.body || {};
  if (user === ADMIN_USER && checkPassword(password)) {
    res.setHeader("Set-Cookie", `jr_admin=${makeToken()}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${TOKEN_TTL / 1000}`);
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: "Invalid credentials." });
});

app.post("/api/admin/logout", (_req, res) => {
  res.setHeader("Set-Cookie", "jr_admin=; HttpOnly; Path=/; Max-Age=0");
  res.json({ success: true });
});

app.get("/api/admin/check", (req, res) => {
  res.json({ authenticated: verifyToken(getCookie(req, "jr_admin")) });
});

/* =====================================================================
   ADMIN — enquiries
   ===================================================================== */
app.get("/api/admin/enquiries", requireAdmin, (_req, res) => {
  res.json(db.prepare("SELECT * FROM enquiries ORDER BY id DESC").all());
});
app.patch("/api/admin/enquiries/:id", requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const ok = ["new", "read"].includes(status);
  if (!ok) return res.status(400).json({ success: false, error: "Invalid status" });
  db.prepare("UPDATE enquiries SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});
app.delete("/api/admin/enquiries/:id", requireAdmin, (req, res) => {
  db.prepare("DELETE FROM enquiries WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

/* =====================================================================
   ADMIN — CRUD helpers (generic)
   ===================================================================== */
function crudRoutes(base, table, mapper) {
  const list = db.prepare(`SELECT * FROM ${table} ORDER BY id DESC`);
  const get = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
  const del = db.prepare(`DELETE FROM ${table} WHERE id = ?`);

  app.get(`/api/admin/${base}`, requireAdmin, (_req, res) => res.json(list.all()));
  app.delete(`/api/admin/${base}/:id`, requireAdmin, (req, res) => {
    del.run(req.params.id);
    res.json({ success: true });
  });
  return { get, mapper };
}

function buildRow(table, body, fields) {
  const row = {};
  for (const f of fields) row[f] = body[f] !== undefined ? String(body[f] ?? "").trim() : "";
  return row;
}

/* --- songs --- */
{
  const fields = ["title","artist","description","genre","release_date","cover","audio","youtube_id","spotify","apple_music","youtube","audiomack"];
  crudRoutes("songs", "songs");
  const insert = db.prepare(`INSERT INTO songs (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`);
  const update = db.prepare(`UPDATE songs SET ${fields.map((f)=>`${f}=?`).join(",")} WHERE id=?`);
  app.post("/api/admin/songs", requireAdmin, (req, res) => {
    const r = buildRow("songs", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    const info = insert.run(...fields.map((f) => r[f]));
    res.json({ success: true, id: info.lastInsertRowid });
  });
  app.put("/api/admin/songs/:id", requireAdmin, (req, res) => {
    const r = buildRow("songs", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    update.run(...fields.map((f) => r[f]), req.params.id);
    res.json({ success: true });
  });
}

/* --- videos --- */
{
  const fields = ["title","song_title","description","release_date","thumbnail","video_url"];
  crudRoutes("videos", "videos");
  const insert = db.prepare(`INSERT INTO videos (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`);
  const update = db.prepare(`UPDATE videos SET ${fields.map((f)=>`${f}=?`).join(",")} WHERE id=?`);
  app.post("/api/admin/videos", requireAdmin, (req, res) => {
    const r = buildRow("videos", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    const info = insert.run(...fields.map((f) => r[f]));
    res.json({ success: true, id: info.lastInsertRowid });
  });
  app.put("/api/admin/videos/:id", requireAdmin, (req, res) => {
    const r = buildRow("videos", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    update.run(...fields.map((f) => r[f]), req.params.id);
    res.json({ success: true });
  });
}

/* --- songwriting --- */
{
  const fields = ["title","genre","description","lyrics_excerpt","audio"];
  crudRoutes("songwriting", "songwriting");
  const insert = db.prepare(`INSERT INTO songwriting (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`);
  const update = db.prepare(`UPDATE songwriting SET ${fields.map((f)=>`${f}=?`).join(",")} WHERE id=?`);
  app.post("/api/admin/songwriting", requireAdmin, (req, res) => {
    const r = buildRow("songwriting", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    const info = insert.run(...fields.map((f) => r[f]));
    res.json({ success: true, id: info.lastInsertRowid });
  });
  app.put("/api/admin/songwriting/:id", requireAdmin, (req, res) => {
    const r = buildRow("songwriting", req.body || {}, fields);
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    update.run(...fields.map((f) => r[f]), req.params.id);
    res.json({ success: true });
  });
}

/* --- projects --- */
{
  const fields = ["title","category","description","image","media_type","media_url","year","details"];
  crudRoutes("projects", "projects");
  const insert = db.prepare(`INSERT INTO projects (${fields.join(",")}) VALUES (${fields.map(()=>"?").join(",")})`);
  const update = db.prepare(`UPDATE projects SET ${fields.map((f)=>`${f}=?`).join(",")} WHERE id=?`);
  const buildProject = (body) => {
    const r = buildRow("projects", body || {}, fields);
    const details = body.details;
    r.details = Array.isArray(details) ? JSON.stringify(details.map(String)) : (details ? JSON.stringify(String(details).split("\n").map((s)=>s.trim()).filter(Boolean)) : "[]");
    if (!["music","songwriting","production","lyric-video"].includes(r.category)) r.category = "music";
    r.media_type = r.media_type === "video" ? "video" : "image";
    return r;
  };
  app.post("/api/admin/projects", requireAdmin, (req, res) => {
    const r = buildProject(req.body || {});
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    const info = insert.run(...fields.map((f) => r[f]));
    res.json({ success: true, id: info.lastInsertRowid });
  });
  app.put("/api/admin/projects/:id", requireAdmin, (req, res) => {
    const r = buildProject(req.body || {});
    if (!r.title) return res.status(400).json({ success: false, error: "Title is required." });
    update.run(...fields.map((f) => r[f]), req.params.id);
    res.json({ success: true });
  });
}

/* --- settings --- */
app.get("/api/admin/settings", requireAdmin, (_req, res) => res.json(getSettings()));
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  const set = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  const { about, social } = req.body || {};
  if (about) set.run("about", JSON.stringify(about));
  if (social) set.run("social", JSON.stringify(social));
  res.json({ success: true });
});

/* --- upload --- */
app.post("/api/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: "No file uploaded." });
  res.json({ success: true, url: "/uploads/" + req.file.filename });
});

/* =====================================================================
   Dashboard + SPA fallback
   ===================================================================== */
app.get("/admin", (_req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => {
  console.log(`Jackson Ryder website running on http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});
