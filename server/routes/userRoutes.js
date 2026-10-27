const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getFacultyDirectory,
} = require('../controllers/userController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');

router.get('/faculty', authenticate, getFacultyDirectory);
router.get('/', authenticate, requireRole('admin'), getAllUsers);
router.put('/:id/status', authenticate, requireRole('admin'), updateUserStatus);
router.put('/:id/role', authenticate, requireRole('admin'), updateUserRole);
router.delete('/:id', authenticate, requireRole('admin'), deleteUser);

module.exports = router;
