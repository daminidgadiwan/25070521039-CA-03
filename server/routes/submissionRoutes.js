const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  gradeSubmission,
  getMySubmissions,
} = require('../controllers/submissionController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', authenticate, requireRole('student'), getMySubmissions);
router.post('/:assignmentId', authenticate, requireRole('student'), upload.single('submissionFile'), submitAssignment);
router.put('/:submissionId/grade', authenticate, requireRole('faculty', 'admin'), gradeSubmission);

module.exports = router;
