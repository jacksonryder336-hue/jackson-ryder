/* =====================================================================
   JACKSON RYDER, WEBSITE CONTENT
   ---------------------------------------------------------------------
   This is the ONLY file you need to edit to update the website.

   ► Add a new song      → copy a block inside  SONGS
   ► Add a lyric video   → copy a block inside  LYRIC_VIDEOS
   ► Add a project       → copy a block inside  PORTFOLIO_ITEMS
   ► Change your bio     → edit the  ABOUT  object
   ► Change social links → edit  SITE.social

   Everything below is a PLACEHOLDER, replace it with your real
   content. New items automatically appear on the site, no redesign.
   ===================================================================== */

const SITE = {
  name: "Jackson Ryder",
  tagline: "Singer | Songwriter | Music Producer | Lyric Video Creator",
  contactEmail: "jacksonryder336@gmail.com",      // enquiries are delivered here
  location: "Pittsburgh, United States",

  /* ---------- SOCIAL LINKS ----------
     Replace every "#" with your real profile URL, e.g.
     instagram: "https://instagram.com/jacksonryder"                 */
  social: {
    youtube:    "#",
    instagram:  "#",
    tiktok:     "#",
    facebook:   "#",
    spotify:    "#",
    appleMusic: "#",
    soundcloud: "#",
    audiomack:  "#"
  }
};

/* =====================================================================
   ABOUT, the artist bio (edit freely)
   ===================================================================== */
const ABOUT = {
  photo: "assets/about-portrait.jpg",   // replace with your own photo
  heading: "The Artist Behind the Music",
  intro: "Jackson Ryder is a singer, songwriter, music producer and lyric video creator crafting music that speaks and stories that stay.",
  bio: [
    "Replace this paragraph with your biography, who you are, where you come from, and what drives you as an artist.",
    "Replace this paragraph with your musical background and creative journey, how you started, what shaped your sound, and the milestones along the way."
  ],
  points: [
    { label: "Musical Style", text: "Describe your style here, e.g. a fusion of Afro-fusion, R&B and contemporary pop." },
    { label: "Vision",       text: "Describe your vision here, the message you want your music to carry into the world." },
    { label: "Experience",   text: "Describe your experience here, years in music, collaborations, and notable work." }
  ]
};

/* =====================================================================
   MUSIC / SONGS
   ---------------------------------------------------------------------
   Fields:
     title, artist, cover (image path), genre, releaseDate, description
     audioUrl  → direct .mp3 link (shows an in-page audio player)
     youtubeId → YouTube video ID (the "Listen" button opens it)
     links     → { spotify, appleMusic, youtube, audiomack } URLs
   Leave audioUrl / youtubeId as "" until your file is ready.
   ===================================================================== */
var SONGS = [
  {
    title: "Silent Thug",
    artist: "Jackson Ryder",
    cover: "assets/cover-silent-thug.jpg",
    genre: "Genre",
    releaseDate: "2026",
    description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it.",
    audioUrl: "",
    youtubeId: "",
    links: {
      spotify: "#",
      appleMusic: "#",
      youtube: "#",
      audiomack: "#"
    }
  },
  {
    title: "Your Song Title",
    artist: "Jackson Ryder",
    cover: "assets/cover-1.jpg",
    genre: "Genre",
    releaseDate: "2026",
    description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it.",
    audioUrl: "",
    youtubeId: "",
    links: {
      spotify: "#",
      appleMusic: "#",
      youtube: "#",
      audiomack: "#"
    }
  },
  {
    title: "Your Song Title",
    artist: "Jackson Ryder",
    cover: "assets/cover-2.jpg",
    genre: "Genre",
    releaseDate: "2026",
    description: "Replace this text with a short description of the song, the story behind it, the mood, and what inspired it.",
    audioUrl: "",
    youtubeId: "",
    links: {
      spotify: "#",
      appleMusic: "#",
      youtube: "#",
      audiomack: "#"
    }
  }
];

/* =====================================================================
   LYRIC VIDEOS
   ---------------------------------------------------------------------
   Fields:
     title (video name), songTitle, thumbnail, description, releaseDate,
     videoUrl → a YouTube / Vimeo watch link OR embed link.
   ===================================================================== */
var LYRIC_VIDEOS = [
  {
    title: "Your Lyric Video",
    songTitle: "Song Title",
    thumbnail: "assets/video-1.jpg",
    description: "Replace this text with a short description of the lyric video and the song it visualises.",
    releaseDate: "2026",
    videoUrl: ""          // e.g. "https://www.youtube.com/watch?v=VIDEO_ID"
  },
  {
    title: "Your Lyric Video",
    songTitle: "Song Title",
    thumbnail: "assets/video-2.jpg",
    description: "Replace this text with a short description of the lyric video and the song it visualises.",
    releaseDate: "2026",
    videoUrl: ""
  },
  {
    title: "Your Lyric Video",
    songTitle: "Song Title",
    thumbnail: "assets/video-3.jpg",
    description: "Replace this text with a short description of the lyric video and the song it visualises.",
    releaseDate: "2026",
    videoUrl: ""
  }
];

/* =====================================================================
   SONGWRITING PROJECTS
   ---------------------------------------------------------------------
   Fields: title, genre, description, lyricsExcerpt, audioUrl (demo)
   ===================================================================== */
var SONGWRITING_PROJECTS = [
  {
    title: "Your Songwriting Project",
    genre: "Genre",
    description: "Replace this text with a summary of the songwriting project, the story, emotion or idea you turned into a song.",
    lyricsExcerpt: "Replace this with a short excerpt of the lyrics, two or three lines that capture the heart of the song.",
    audioUrl: ""
  },
  {
    title: "Your Songwriting Project",
    genre: "Genre",
    description: "Replace this text with a summary of the songwriting project, the story, emotion or idea you turned into a song.",
    lyricsExcerpt: "Replace this with a short excerpt of the lyrics, two or three lines that capture the heart of the song.",
    audioUrl: ""
  },
  {
    title: "Your Songwriting Project",
    genre: "Genre",
    description: "Replace this text with a summary of the songwriting project, the story, emotion or idea you turned into a song.",
    lyricsExcerpt: "Replace this with a short excerpt of the lyrics, two or three lines that capture the heart of the song.",
    audioUrl: ""
  }
];

/* =====================================================================
   PRODUCTION SERVICES  (icon keys below)
   ===================================================================== */
var PRODUCTION_SERVICES = [
  { icon: "production",   name: "Music Production",     description: "Full production from raw idea to finished record, sound design, arrangement and polish." },
  { icon: "beat",         name: "Beat Production",      description: "Original, radio-ready beats built around your sound and direction." },
  { icon: "arrangement",  name: "Song Arrangement",     description: "Structuring songs so every section hits with intention, energy and emotion." },
  { icon: "vocal",        name: "Vocal Production",     description: "Vocal direction, comping and tuning for performances that feel alive." },
  { icon: "recording",    name: "Recording Support",    description: "Guided recording sessions that capture your best take." },
  { icon: "mixing",       name: "Mixing",               description: "Clean, balanced, professional mixes that translate on every speaker." },
  { icon: "direction",    name: "Creative Direction",   description: "Shaping the vision and identity of a song or project end to end." }
];

/* =====================================================================
   PORTFOLIO  (category: "music" | "songwriting" | "production" | "lyric-video")
   mediaType: "image" or "video"; mediaUrl = video embed/watch link if video
   ===================================================================== */
/* Portfolio projects are managed through the admin dashboard (/admin).
   This array is intentionally empty — add your projects there and they
   will appear on the site automatically. */
var PORTFOLIO_ITEMS = [];

/* =====================================================================
   SERVICES (the four main services), "Enquire Now" opens the contact
   form with the matching service pre-selected.
   ===================================================================== */
var SERVICES = [
  {
    name: "Singer",
    tagline: "Professional vocal performances and recording.",
    icon: "singer",
    bullets: ["Lead & session vocals", "Studio-ready takes", "Live-ready performance"]
  },
  {
    name: "Songwriter",
    tagline: "Original lyrics, melodies, songwriting and creative concepts.",
    icon: "songwriter",
    bullets: ["Original lyrics", "Melody & topline", "Song concepts & ideas"]
  },
  {
    name: "Music Producer",
    tagline: "Production, arrangement, beat creation, vocal production and creative direction.",
    icon: "producer",
    bullets: ["Full production", "Beats & arrangement", "Mixing & direction"]
  },
  {
    name: "Lyric Video Creator",
    tagline: "Professional lyric videos that bring songs and lyrics to life.",
    icon: "lyric-video",
    bullets: ["Typography & motion", "Visual storytelling", "Cinematic effects"]
  }
];

/* =====================================================================
   TESTIMONIALS (replace with real words from clients & collaborators)
   ===================================================================== */
var TESTIMONIALS = [
  {
    quote: "Replace this with a real testimonial from a client, collaborator or fan.",
    name: "Client Name",
    role: "Artist"
  },
  {
    quote: "Replace this with a real testimonial from a client, collaborator or fan.",
    name: "Client Name",
    role: "Producer"
  },
  {
    quote: "Replace this with a real testimonial from a client, collaborator or fan.",
    name: "Client Name",
    role: "Singer"
  }
];
