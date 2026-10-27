const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');

// @desc    Get all study materials / notes
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res, next) => {
  try {
    const { subject, department, semester, search } = req.query;
    const filter = {};

    if (subject) filter.subject = new RegExp(subject, 'i');
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
      ];
    }

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name email role department')
      .sort({ createdAt: -1 });

    // Distinct subjects for filtering
    const subjects = await Material.distinct('subject');

    res.status(200).json({
      success: true,
      count: materials.length,
      subjects,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload study material
// @route   POST /api/materials
// @access  Faculty / Admin
const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, department, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a file to upload',
      });
    }

    if (!title || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title and subject are required',
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const material = await Material.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      subject: subject.trim(),
      department: department || req.user.department || 'Computer Science & Engineering',
      semester: semester || 'Semester 6',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: fileExt,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
    });

    const populated = await Material.findById(material._id).populate('uploadedBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      material: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / increment download counter
// @route   GET /api/materials/:id/download
// @access  Private
const downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    material.downloadCount += 1;
    await material.save();

    res.status(200).json({
      success: true,
      downloadUrl: material.fileUrl,
      fileName: material.fileName,
      downloadCount: material.downloadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Faculty / Admin
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    if (req.user.role !== 'admin' && material.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this material' });
    }

    // Try to remove file from disk
    try {
      const filePath = path.join(__dirname, '..', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.warn('Could not remove physical file:', e.message);
    }

    await material.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
};
