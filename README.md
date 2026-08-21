# Jackson Ryder — Official Website

A premium, cinematic website for **Jackson Ryder — Singer, Songwriter, Music
Producer and Lyric Video Creator**, with a built-in **admin dashboard** for
managing all content, a **database**, **file uploads**, and a **contact form
that emails enquiries straight to Gmail**.

---

## ✨ Features

- **Public site** — Home, About, Music, Songwriting, Production, Lyric Videos,
  Portfolio (with filters + detail modals), Services, Testimonials, Contact.
- **Admin dashboard** at `/admin` — manage songs, lyric videos, songwriting
  projects, portfolio projects, enquiries and settings — no code needed.
- **Database** (SQLite) storing all content and every enquiry.
- **File uploads** — audio, video and images, uploaded from the dashboard.
- **Contact form** → validated, spam-protected, rate-limited → emails you
  (Gmail) **and** saves the enquiry in the dashboard.
- SEO, Open Graph, responsive design, lazy-loading, smooth animations.

---

## ⚡ Quick start

```bash
npm install
cp .env.example .env      # then edit .env (email + admin password)
npm start
```

- Website: http://localhost:3000
- **Admin dashboard:** http://localhost:3000/admin

Default admin login (change it in `.env`):

```
Username: admin
Password: jackson2026   ← change this!
```

---

## ✉️ 1. Enable Gmail notifications (required for email to work)

The form **saves every enquiry to the database regardless**, but to also receive
the email in your inbox:

1. Enable **2-Step Verification** for `jacksoonryder336@gmail.com`:
   https://myaccount.google.com/security
2. Create an **App Password**: https://myaccount.google.com/apppasswords
3. In `.env` set:
   ```
   SMTP_USER=jacksoonryder336@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

Alternatively set `RESEND_API_KEY` to use the Resend service.

---

## 🖥️ 2. Use the admin dashboard

Go to `/admin` and sign in. From there you can:

| Tab          | What you manage                                            |
|--------------|------------------------------------------------------------|
| Dashboard    | Overview + recent enquiries                                |
| Songs        | Add/edit/delete songs — title, artist, genre, cover art, **audio file**, streaming links (Spotify/Apple/YouTube/Audiomack), YouTube ID |
| Lyric Videos | Add/edit/delete — thumbnail, title, song, **video URL**    |
| Songwriting  | Add/edit/delete — title, genre, description, **lyrics**, demo audio |
| Portfolio    | Add/edit/delete — title, category, image, media, details   |
| Enquiries    | Read, reply-to and manage every submitted enquiry          |
| Settings     | Edit your bio/photo and all social media links             |

**Uploads:** click "Upload" next to any cover/thumbnail/audio field to upload a
file, or paste a URL. Uploaded files are stored in `public/uploads/`.

---

## 🚀 3. Deploy (get a permanent URL)

The site + dashboard + database need a server that runs Node.js.

| Host | Notes |
|------|-------|
| **Render** | Free tier. Use the included `render.yaml` (Blueprint). |
| **Railway / Fly.io / Heroku** | Same idea — deploy the folder, set env vars. |
| **A VPS (e.g. DigitalOcean)** | Best for permanent storage of database + uploads. |

Set these environment variables on the host:
`SMTP_USER`, `SMTP_PASS`, `ADMIN_USER`, `ADMIN_PASSWORD`, and optionally `SECRET` and `MAIL_TO`.

> ⚠️ **Important about free hosts:** the *free* tiers of Render/Railway use an
> **ephemeral filesystem**, so the SQLite database and any uploaded files are
> reset on each redeploy. For fully permanent data you have two options:
> 1. **A VPS** (or any host with a persistent disk) — everything just works.
> 2. **Managed services** — swap SQLite for a hosted Postgres (e.g. Neon,
>    Supabase, Render Postgres) and uploads for object storage (Cloudinary,
>    S3). This requires the user's own accounts/keys.

---

## 🔒 Security (built in)

- Server-side validation of every field
- Honeypot field + rate limiting (5/15 min per visitor) against spam
- HTML-escaping everywhere (prevents injection)
- Admin area protected by a signed, HttpOnly session cookie
- API keys only in environment variables, never in frontend code

---

## 📁 Project structure

```
jackson-ryder/
├── server.js            # Express server: site + API + admin + email + uploads
├── db.js                # SQLite database (schema + seed)
├── data/                # the database file (created automatically)
├── public/
│   ├── index.html       # public site
│   ├── admin.html       # admin dashboard
│   ├── css/, js/        # styles + logic
│   ├── assets/          # images
│   └── uploads/         # your uploaded files
└── .env                 # your secrets (never commit)
```
