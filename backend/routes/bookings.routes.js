const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');

router.get('/', bookingsController.getBookings);
router.get('/user/:userId', bookingsController.getBookingsByUser);
router.post('/', bookingsController.createBooking);
router.patch('/:id/status', bookingsController.updateBookingStatus);

module.exports = router;
