const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  holdSeats,
  releaseSeats,
} = require('../controllers/eventController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);
router.post('/', authenticate, requireRole('admin', 'faculty'), upload.single('banner'), createEvent);
router.put('/:id', authenticate, requireRole('admin', 'faculty'), upload.single('banner'), updateEvent);
router.delete('/:id', authenticate, requireRole('admin'), deleteEvent);
router.post('/:id/hold-seats', authenticate, holdSeats);
router.post('/:id/release-seats', authenticate, releaseSeats);

module.exports = router;
