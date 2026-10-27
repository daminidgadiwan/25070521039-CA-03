const express = require('express');
const router = express.Router();
const {
  bookSeats,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, bookSeats);
router.get('/my', authenticate, getMyBookings);
router.get('/admin/all', authenticate, requireRole('admin'), getAllBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/cancel', authenticate, cancelBooking);

module.exports = router;
