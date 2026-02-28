const express = require('express');
const router = express.Router();
const mapplsController = require('../controllers/mapplsController');
const { protect } = require('../middleware/auth');

// Public route to get token (unless you want it protected)
router.get('/token', mapplsController.getToken);

// Protected search route (example usage)
router.get('/search', protect, mapplsController.searchPlaces);

module.exports = router;
