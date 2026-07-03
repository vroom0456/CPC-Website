const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

router.get('/', eventsController.listEvents);
router.get('/:id/photos', eventsController.getEventPhotos);

module.exports = router;
