-- ===========================================
-- Photo Club Gallery — Seed Data
-- (mirrors the original CONFIG.EVENTS array)
-- ===========================================

INSERT INTO events (id, title, event_date, photographer, folder_id, cover_file_id) VALUES
  ('event-1', 'The Weeknd Collection', 'July 15, 2026', 'Varun Teja Cherukuthota', '1-83II40IfNkCy6T4TKoM6TAH9pPWJwyo', NULL),
  ('event-2', 'Campus Chronicles',     'August 02, 2026', 'Varun Teja Cherukuthota', '1DP9PIWvdKrD7tlMPg5jWQa_uKEyvBBs-', NULL);

INSERT INTO tags (event_id, name, sort_order) VALUES
  ('event-1', 'Concert',   0),
  ('event-1', 'Portraits', 1),
  ('event-1', 'Night',     2),
  ('event-2', 'Campus',    0),
  ('event-2', 'Candid',    1),
  ('event-2', 'Friends',   2);
