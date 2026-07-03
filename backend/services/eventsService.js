const db = require('../config/db');

function getAllEvents() {
  const events = db.prepare('SELECT * FROM events ORDER BY created_at ASC').all();
  const tagStmt = db.prepare('SELECT name FROM tags WHERE event_id = ? ORDER BY sort_order ASC');
  return events.map(e => ({
    id: e.id,
    title: e.title,
    date: e.event_date,
    photographer: e.photographer,
    folderId: e.folder_id,
    coverFileId: e.cover_file_id,
    tags: tagStmt.all(e.id).map(t => t.name)
  }));
}

function getEventById(id) {
  const e = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  if (!e) return null;
  const tags = db.prepare('SELECT name FROM tags WHERE event_id = ? ORDER BY sort_order ASC').all(id).map(t => t.name);
  return {
    id: e.id,
    title: e.title,
    date: e.event_date,
    photographer: e.photographer,
    folderId: e.folder_id,
    coverFileId: e.cover_file_id,
    tags
  };
}

function updateCoverFileId(id, coverFileId) {
  db.prepare('UPDATE events SET cover_file_id = ? WHERE id = ?').run(coverFileId, id);
}

module.exports = { getAllEvents, getEventById, updateCoverFileId };
