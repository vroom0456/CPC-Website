const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

// --- Public routes (live) ---
router.get('/', eventsController.listEvents);
router.get('/:id/photos', eventsController.getEventPhotos);

// --- Admin routes — disabled for the MVP launch ---
// Uncomment once eventsController exports createEvent/downloadGalleryZip
// again and an auth middleware guards them. See the guide below.
// router.post('/', requireAdmin, eventsController.createEvent);
// router.get('/:id/download', requireAdmin, eventsController.downloadGalleryZip);

module.exports = router;
