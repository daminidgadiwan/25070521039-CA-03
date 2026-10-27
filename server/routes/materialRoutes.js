const express = require('express');
const router = express.Router();
const {
  getMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
} = require('../controllers/materialController');
const { authenticate, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', authenticate, getMaterials);
router.post('/', authenticate, requireRole('faculty', 'admin'), upload.single('materialFile'), uploadMaterial);
router.get('/:id/download', authenticate, downloadMaterial);
router.delete('/:id', authenticate, requireRole('faculty', 'admin'), deleteMaterial);

module.exports = router;
