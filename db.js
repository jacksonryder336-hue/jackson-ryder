/**
 * Jackson Ryder — Database layer (SQLite via better-sqlite3)
 * Stores songs, lyric videos, songwriting projects, portfolio projects,
 * enquiries, and site settings. Seeded once with placeholder content.
 */

const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "jackson-ryder.db"));
db.pragma("journal_mode = WAL");

/* ----------------------------- schema ----------------------------- */
db.exec(`
CREATE TABLE IF NOT EXISTS songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  song_title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  release_date TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS songwriting (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  genre TEXT DEFAULT '',
  description TEXT DEFAULT '',
  lyrics_excerpt TEXT DEFAULT '',
  audio TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'music',
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  media_type TEXT DEFAULT 'image',
  media_url TEXT DEFAULT '',
  year TEXT DEFAULT '',
  details TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  service TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);
`);

/* --------------------------- seed (once) --------------------------- */
const count = db.prepare("SELECT COUNT(*) AS c FROM songs").get().c;
if (count === 0) {
  const insSong = db.prepare(`
    INSERT INTO songs (title, artist, description, genre, release_date, cover)
    VALUES (@title, @artist, @description, @genre, @release_date, @cover)`);

  insSong.run({
    title: "Silent Thug", artist: "Jackson Ryder", genre: "Genre", release_date: "2026",
    cover: "assets/cover-silent-thug.jpg",
    description: "Replace this text with a short description of the song — the story behind it, the mood, and what inspired it.",
  });
  insSong.run({
    title: "Your Song Title", artist: "Jackson Ryder", genre: "Genre", release_date: "2026",
    cover: "assets/cover-1.jpg",
    description: "Replace this text with a short description of the song — the story behind it, the mood, and what inspired it.",
  });
  insSong.run({
    title: "Your Song Title", artist: "Jackson Ryder", genre: "Genre", release_date: "2026",
    cover: "assets/cover-2.jpg",
    description: "Replace this text with a short description of the song — the story behind it, the mood, and what inspired it.",
  });

  const insVideo = db.prepare(`
    INSERT INTO videos (title, song_title, description, release_date, thumbnail)
    VALUES (@title, @song_title, @description, @release_date, @thumbnail)`);
  [["assets/video-1.jpg"], ["assets/video-2.jpg"], ["assets/video-3.jpg"]].forEach(([t]) => {
    insVideo.run({
      title: "Your Lyric Video", song_title: "Song Title", release_date: "2026",
      thumbnail: t,
      description: "Replace this text with a short description of the lyric video and the song it visualises.",
    });
  });

  const insSw = db.prepare(`
    INSERT INTO songwriting (title, genre, description, lyrics_excerpt)
    VALUES (@title, @genre, @description, @lyrics_excerpt)`);
  for (let i = 0; i < 3; i++) {
    insSw.run({
      title: "Your Songwriting Project", genre: "Genre",
      description: "Replace this text with a summary of the songwriting project.",
      lyrics_excerpt: "Replace this with a short excerpt of the lyrics.",
    });
  }

  const insProject = db.prepare(`
    INSERT INTO projects (title, category, description, image, media_type, media_url, year, details)
    VALUES (@title, @category, @description, @image, @media_type, @media_url, @year, @details)`);
  const seedProjects = [
    ["Your Project", "music", "assets/cover-1.jpg", "image"],
    ["Your Project", "songwriting", "assets/cover-2.jpg", "image"],
    ["Your Project", "production", "assets/cover-3.jpg", "image"],
    ["Your Lyric Video", "lyric-video", "assets/video-1.jpg", "video"],
    ["Your Project", "music", "assets/cover-silent-thug.jpg", "image"],
    ["Your Lyric Video", "lyric-video", "assets/video-2.jpg", "video"],
  ];
  seedProjects.forEach(([title, cat, img, mt]) => {
    insProject.run({
      title, category: cat, image: img, media_type: mt, media_url: "", year: "2026",
      description: "Replace this text with a description of the project.",
      details: JSON.stringify(["Replace with a project detail.", "Replace with another detail."]),
    });
  });

  const set = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
  set.run("about", JSON.stringify({
    photo: "assets/about-portrait.jpg",
    heading: "The Artist Behind the Music",
    intro: "Jackson Ryder is a singer, songwriter, music producer and lyric video creator crafting music that speaks and stories that stay.",
    bio: [
      "Replace this paragraph with your biography — who you are, where you come from, and what drives you as an artist.",
      "Replace this paragraph with your musical background and creative journey.",
    ],
    points: [
      { label: "Musical Style", text: "Describe your style here." },
      { label: "Vision", text: "Describe your vision here." },
      { label: "Experience", text: "Describe your experience here." },
    ],
  }));
  set.run("social", JSON.stringify({
    youtube: "#", instagram: "#", tiktok: "#", facebook: "#",
    spotify: "#", appleMusic: "#", soundcloud: "#", audiomack: "#",
  }));

  console.log("[db] Seeded placeholder content.");
}

/* ----------------------------- helpers ----------------------------- */
function getSettings() {
  const out = {};
  for (const row of db.prepare("SELECT key, value FROM settings").all()) {
    try { out[row.key] = JSON.parse(row.value); } catch { out[row.key] = row.value; }
  }
  return out;
}

module.exports = { db, getSettings };
