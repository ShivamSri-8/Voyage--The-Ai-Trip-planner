const express = require('express');
const router = express.Router();
const { generateTrip, getTrips, getTripById, deleteTrip } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// All trip routes are protected
router.use(protect);

router.post('/generate-trip', generateTrip);
router.get('/trips', getTrips);
router.get('/trips/:id', getTripById);
router.delete('/trips/:id', deleteTrip);

module.exports = router;
