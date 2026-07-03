const eventsService = require('../services/eventsService');
const driveService = require('../services/driveService');

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

module.exports = { listEvents, getEventPhotos };
