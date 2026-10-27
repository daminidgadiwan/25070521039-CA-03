const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private (or Public)
const getAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;

    // Audience filter: Admin sees all; Student sees 'all' or 'students'; Faculty sees 'all' or 'faculty'
    if (req.user && req.user.role !== 'admin') {
      filter.targetAudience = { $in: ['all', req.user.role === 'student' ? 'students' : 'faculty'] };
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
      ];
    }

    const announcements = await Announcement.find(filter)
      .populate('author', 'name email role department')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Faculty / Admin
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetAudience, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      category: category || 'General',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      isPinned: Boolean(isPinned),
      author: req.user._id,
    });

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name email role department');

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Author / Admin
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this announcement' });
    }

    const { title, content, category, priority, targetAudience, isPinned } = req.body;
    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (isPinned !== undefined) announcement.isPinned = Boolean(isPinned);

    await announcement.save();

    const populated = await Announcement.findById(announcement._id)
      .populate('author', 'name email role department');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Author / Admin
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this announcement' });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
