# Photo Club Gallery — Restructured

Your original single-file HTML app, split into a proper **frontend / backend / db** stack.
The Google Drive API key now lives only on the server — it never ships to the browser.

```
photo-club/
├── frontend/               # Static site (HTML/CSS/JS) — the UI
│   └── public/
│       ├── index.html
│       ├── css/styles.css
│       └── js/
│           ├── config.js     # API base URL
│           ├── api.js        # fetch wrappers for the backend
│           ├── theme.js       # dark/light mode
│           ├── render.js      # home + gallery view rendering
│           ├── lightbox.js    # lightbox & slideshow
│           └── main.js        # boot/init
│
├── backend/                 # Express API — proxies Google Drive, hides the key
│   ├── server.js
│   ├── routes/events.js
│   ├── controllers/eventsController.js
│   ├── services/
│   │   ├── driveService.js   # talks to Google Drive API
│   │   └── eventsService.js  # talks to the DB
│   ├── config/{db.js, env.js}
│   ├── .env.example
│   └── package.json
│
└── db/                       # SQLite database (events + tags)
    ├── schema.sql
    ├── seed.sql              # your two original events, preloaded
    └── init-db.js            # creates db/photoclub.db
```

## How it fits together

1. **db/** stores each event's title, date, photographer, Drive folder ID, and tags —
   the same data that used to be hardcoded in `CONFIG.EVENTS`.
2. **backend/** reads events from the DB, calls the Google Drive API with the key from
   `.env`, and exposes two endpoints:
   - `GET /api/events` — all events + cover image URL
   - `GET /api/events/:id/photos` — full tagged photo list for one event
3. **frontend/** is the same UI as before (Tailwind + Lucide + vanilla JS), just calling
   `backend`'s endpoints instead of Google Drive directly, and with no API key embedded
   in the page source.

## Setup

```bash
# 1) Database
cd db
npm init -y --silent  # only if you want its own package.json; not required
node init-db.js        # creates db/photoclub.db, seeded with your 2 events

# 2) Backend
cd ../backend
npm install
cp .env.example .env   # then paste your real Google Drive API key into .env
npm start               # → http://localhost:4000

# 3) Frontend
cd ../frontend/public
# any static server works, e.g.:
npx serve .              # → http://localhost:3000 (or similar)
```

Open the frontend URL in your browser. It talks to the backend on `http://localhost:4000`
(change this in `frontend/public/js/config.js` if you deploy the backend elsewhere).

## Adding a new event

Instead of editing HTML, insert a row into the database:

```sql
INSERT INTO events (id, title, event_date, photographer, folder_id)
VALUES ('event-3', 'New Event', 'Sept 01, 2026', 'Photographer Name', 'YOUR_DRIVE_FOLDER_ID');

INSERT INTO tags (event_id, name, sort_order) VALUES
  ('event-3', 'Tag One', 0),
  ('event-3', 'Tag Two', 1);
```

## Notes

- `better-sqlite3` is used for zero-config local storage; swap in Postgres/MySQL later
  by changing `backend/config/db.js` and `backend/services/eventsService.js` — the
  routes/controllers won't need to change.
- Requires Node.js 18+ (uses the built-in `fetch`).
