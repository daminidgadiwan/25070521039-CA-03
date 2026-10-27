const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getFacultyAttendance,
  getEligibleStudents,
} = require('../controllers/attendanceController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticate, requireRole('faculty', 'admin'), markAttendance);
router.get('/student', authenticate, getStudentAttendance);
router.get('/student/:studentId', authenticate, requireRole('faculty', 'admin'), getStudentAttendance);
router.get('/faculty', authenticate, requireRole('faculty', 'admin'), getFacultyAttendance);
router.get('/students', authenticate, requireRole('faculty', 'admin'), getEligibleStudents);

module.exports = router;
