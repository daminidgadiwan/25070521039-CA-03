const express = require('express');
const router = express.Router();
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authenticate, getAssignments);
router.get('/:id', authenticate, getAssignmentById);
router.post('/', authenticate, requireRole('faculty', 'admin'), upload.single('attachment'), createAssignment);
router.put('/:id', authenticate, requireRole('faculty', 'admin'), upload.single('attachment'), updateAssignment);
router.delete('/:id', authenticate, requireRole('faculty', 'admin'), deleteAssignment);

module.exports = router;
