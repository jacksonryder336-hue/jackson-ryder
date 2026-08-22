/**
 * Jackson Ryder, Database layer (PostgreSQL via `pg`)
 * Uses Neon (free hosted Postgres) so content survives redeploys.
 *
 * Set DATABASE_URL in the environment, e.g.:
 *   postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
 */

const { Pool } = require("pg");

// Use the connection string, stripping Neon's "channel_binding" param which
// some Node drivers don't support. SSL is required for Neon.
let connectionString = process.env.DATABASE_URL;
if (connectionString) {
  try {
    const u = new URL(connectionString);
    u.searchParams.delete("channel_binding");
    connectionString = u.toString();
  } catch { /* keep original */ }
}

const needsSsl =
  connectionString &&
  (connectionString.includes("neon.tech") || connectionString.includes("sslmode=require"));

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

/** Run a query and return its rows. */
async function query(text, params) {
  const res = await pool.query(text, params);
  return res.rows;
}

/** Create schema if needed. */
async function init() {
  await query(`
    CREATE TABLE IF NOT EXISTS songs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT DEFAULT 'Jackson Ryder',
      description TEXT DEFAULT '',
      genre TEXT DEFAULT '',
      release_date TEXT DEFAULT '',
      cover TEXT DEFAULT '',
      audio TEXT DEFAULT '',
      youtube_id TEXT DEFAULT '',
      spotify TEXT DEFAULT '',
      apple_music TEXT DEFAULT '',
      youtube TEXT DEFAULT '',
      audiomack TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS videos (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      song_title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      release_date TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS songwriting (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      genre TEXT DEFAULT '',
      description TEXT DEFAULT '',
      lyrics_excerpt TEXT DEFAULT '',
      audio TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'music',
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      media_type TEXT DEFAULT 'image',
      media_url TEXT DEFAULT '',
      year TEXT DEFAULT '',
      details TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      service TEXT DEFAULT '',
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
  `);

  // Seed ONLY once (controlled by the "seeded" marker). This ensures that
  // after Jackson clears his content, the placeholder content never returns.
  const seeded = (await query("SELECT value FROM settings WHERE key='seeded'"))[0];
  if (!seeded) {
    const songs = [
      { title: "Silent Thug", artist: "Jackson Ryder", genre: "Genre", release_date: "2026", cover: "assets/cover-silent-thug.jpg", description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it." },
      { title: "Your Song Title", artist: "Jackson Ryder", genre: "Genre", release_date: "2026", cover: "assets/cover-1.jpg", description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it." },
      { title: "Your Song Title", artist: "Jackson Ryder", genre: "Genre", release_date: "2026", cover: "assets/cover-2.jpg", description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it." },
    ];
    for (const s of songs) {
      await query(
        "INSERT INTO songs (title, artist, genre, release_date, cover, description) VALUES ($1,$2,$3,$4,$5,$6)",
        [s.title, s.artist, s.genre, s.release_date, s.cover, s.description]
      );
    }

    const videos = [
      ["assets/video-1.jpg"], ["assets/video-2.jpg"], ["assets/video-3.jpg"],
    ];
    for (const [thumb] of videos) {
      await query(
        "INSERT INTO videos (title, song_title, release_date, thumbnail, description) VALUES ($1,$2,$3,$4,$5)",
        ["Your Lyric Video", "Song Title", "2026", thumb, "Replace this text with a short description of the lyric video and the song it visualises."]
      );
    }

    for (let i = 0; i < 3; i++) {
      await query(
        "INSERT INTO songwriting (title, genre, description, lyrics_excerpt) VALUES ($1,$2,$3,$4)",
        ["Your Songwriting Project", "Genre", "Replace this text with a summary of the songwriting project.", "Replace this with a short excerpt of the lyrics."]
      );
    }

    // NOTE: Portfolio projects are intentionally NOT seeded.
    // Jackson adds his own projects through the admin dashboard (/admin).

    const setAbout = JSON.stringify({
      photo: "assets/about-portrait.jpg",
      heading: "The Artist Behind the Music",
      intro: "Jackson Ryder is a singer, songwriter, music producer and lyric video creator crafting music that speaks and stories that stay.",
      bio: [
        "Replace this paragraph with your biography, who you are, where you come from, and what drives you as an artist.",
        "Replace this paragraph with your musical background and creative journey.",
      ],
      points: [
        { label: "Musical Style", text: "Describe your style here." },
        { label: "Vision", text: "Describe your vision here." },
        { label: "Experience", text: "Describe your experience here." },
      ],
    });
    const setSocial = JSON.stringify({
      youtube: "#", instagram: "#", tiktok: "#", facebook: "#",
      spotify: "#", appleMusic: "#", soundcloud: "#", audiomack: "#",
    });
    await query("INSERT INTO settings (key, value) VALUES ($1,$2), ($3,$4)", ["about", setAbout, "social", setSocial]);

    // Mark seeded so this never runs again.
    await query("INSERT INTO settings (key, value) VALUES ('seeded','1') ON CONFLICT (key) DO UPDATE SET value='1'");

    console.log("[db] Seeded placeholder content (first run only).");
  }
}

async function getSettings() {
  const rows = await query("SELECT key, value FROM settings");
  const out = {};
  for (const row of rows) {
    try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
  }
  return out;
}

module.exports = { pool, query, init, getSettings };
