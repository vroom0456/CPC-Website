const eventsService = require('../services/eventsService');
const driveService = require('../services/driveService');
const db = require('../config/db');

// GET /api/events
// Returns all events with a resolved cover image URL (fetches + caches
// the first image in the Drive folder the first time it's requested).
async function listEvents(req, res) {
  try {
    const events = eventsService.getAllEvents();

    const withCovers = await Promise.all(events.map(async (event) => {
      let coverFileId = event.coverFileId;

      if (!coverFileId) {
        try {
          const files = await driveService.fetchFolderFiles(event.folderId, 1);
          if (files.length > 0) {
            coverFileId = files[0].id;
            eventsService.updateCoverFileId(event.id, coverFileId);
          }
        } catch (err) {
          console.error(`Cover fetch failed for ${event.id}:`, err.message);
        }
      }

      return {
        ...event,
        coverUrl: coverFileId ? driveService.buildImageUrl(coverFileId) : null
      };
    }));

    res.json({ events: withCovers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load events.' });
  }
}

// GET /api/events/:id/photos
// Returns the full, tagged photo list for one event's Drive folder.
async function getEventPhotos(req, res) {
  try {
    const event = eventsService.getEventById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const files = await driveService.fetchFolderFiles(event.folderId, 100);
    if (files.length === 0) {
      return res.json({ event, photos: [] });
    }

    const photos = files.map((file, i) => ({
      id: file.id,
      name: file.name,
      url: driveService.buildImageUrl(file.id),
      downloadUrl: file.webContentLink || driveService.buildImageUrl(file.id),
      tag: event.tags.length ? event.tags[i % event.tags.length] : 'Gallery'
    }));

    res.json({ event, photos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load gallery photos.' });
  }
}

// ===========================================================
// ADMIN-ONLY ENDPOINTS — disabled for the MVP launch.
// Not wired into routes/events.js and not exported below, so none
// of this runs today. Kept here (instead of deleted) so re-enabling
// admin features later is a quick job — see the guide below.
//
// Before turning these back on you will also need to:
//   npm install archiver exifr          (in backend/)
//   Implement db.insertEvent() / db.getEventById() in config/db.js
//   or eventsService.js (they don't exist yet — getAllEvents/getEventById
//   in eventsService.js are the closest reference implementations)
// ===========================================================

// async function createEvent(req, res) {
//   const { title, date, description, folderId, tags } = req.body;
//   try {
//     const files = await driveService.getFilesInFolder(folderId);
//     const eventId = await db.insertEvent({ title, date, description, folderId });
//     res.status(201).json({ message: 'Event created successfully', eventId });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to create event' });
//   }
// }

// async function downloadGalleryZip(req, res) {
//   const archiver = require('archiver');
//   const eventId = req.params.id;
//   try {
//     const event = await db.getEventById(eventId);
//     if (!event) return res.status(404).json({ error: 'Event not found' });
//
//     const files = await driveService.getFilesInFolder(event.folderId);
//     res.attachment(`${event.title.replace(/\s+/g, '_')}_Gallery.zip`);
//
//     const archive = archiver('zip', { zlib: { level: 9 } });
//     archive.on('error', (err) => { throw err; });
//     archive.pipe(res);
//
//     for (const file of files) {
//       const fileStream = await driveService.downloadFileStream(file.id);
//       archive.append(fileStream, { name: file.name });
//     }
//
//     await archive.finalize();
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to generate ZIP' });
//   }
// }

module.exports = { listEvents, getEventPhotos };
