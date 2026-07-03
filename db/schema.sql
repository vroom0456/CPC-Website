-- ===========================================
-- Photo Club Gallery — Database Schema (SQLite)
-- ===========================================

CREATE TABLE IF NOT EXISTS events (
  id            TEXT PRIMARY KEY,       -- e.g. 'event-1'
  title         TEXT NOT NULL,
  event_date    TEXT NOT NULL,          -- display string, e.g. 'July 15, 2026'
  photographer  TEXT NOT NULL,
  folder_id     TEXT NOT NULL,          -- Google Drive folder id
  cover_file_id TEXT,                   -- cached cover image file id (nullable)
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tags_event_id ON tags(event_id);
