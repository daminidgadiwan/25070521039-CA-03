const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { authenticate, requireRole, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getAnnouncements);
router.post('/', authenticate, requireRole('faculty', 'admin'), createAnnouncement);
router.put('/:id', authenticate, requireRole('faculty', 'admin'), updateAnnouncement);
router.delete('/:id', authenticate, requireRole('faculty', 'admin'), deleteAnnouncement);

module.exports = router;
