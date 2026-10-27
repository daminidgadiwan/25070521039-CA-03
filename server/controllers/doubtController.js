const Doubt = require('../models/Doubt');

// @desc    Get all doubts with filters
// @route   GET /api/doubts
// @access  Private
const getDoubts = async (req, res, next) => {
  try {
    const { subject, isSolved, search, sortBy } = req.query;
    const filter = {};

    if (subject && subject !== 'All') filter.subject = subject;
    if (isSolved !== undefined && isSolved !== 'all') {
      filter.isSolved = isSolved === 'true' || isSolved === true;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') },
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sortBy === 'upvotes') {
      sortQuery = { 'upvotes.length': -1, createdAt: -1 };
    }

    const doubts = await Doubt.find(filter)
      .populate('author', 'name email role department avatar')
      .populate('replies.author', 'name email role department avatar')
      .sort(sortQuery);

    const subjects = await Doubt.distinct('subject');

    res.status(200).json({
      success: true,
      count: doubts.length,
      subjects,
      doubts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doubt by ID
// @route   GET /api/doubts/:id
// @access  Private
const getDoubtById = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate('author', 'name email role department avatar')
      .populate('replies.author', 'name email role department avatar');

    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    res.status(200).json({
      success: true,
      doubt,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new doubt
// @route   POST /api/doubts
// @access  Private
const createDoubt = async (req, res, next) => {
  try {
    const { title, description, subject, department, tags } = req.body;

    if (!title || !description || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and subject are required',
      });
    }

    const tagArray = Array.isArray(tags)
      ? tags
      : (tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const doubt = await Doubt.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: department || req.user.department || 'Computer Science & Engineering',
      tags: tagArray,
      author: req.user._id,
    });

    const populated = await Doubt.findById(doubt._id)
      .populate('author', 'name email role department avatar');

    res.status(201).json({
      success: true,
      message: 'Doubt posted successfully',
      doubt: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle upvote on doubt
// @route   POST /api/doubts/:id/upvote
// @access  Private
const upvoteDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const userId = req.user._id.toString();
    const index = doubt.upvotes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      doubt.upvotes.push(req.user._id);
    } else {
      doubt.upvotes.splice(index, 1);
    }

    await doubt.save();

    res.status(200).json({
      success: true,
      upvotesCount: doubt.upvotes.length,
      hasUpvoted: index === -1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add reply to doubt
// @route   POST /api/doubts/:id/replies
// @access  Private
const addReply = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Reply content cannot be empty' });
    }

    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const newReply = {
      author: req.user._id,
      content: content.trim(),
      upvotes: [],
      isAcceptedAnswer: false,
    };

    doubt.replies.push(newReply);
    await doubt.save();

    const populated = await Doubt.findById(doubt._id)
      .populate('author', 'name email role department avatar')
      .populate('replies.author', 'name email role department avatar');

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      doubt: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle upvote on reply
// @route   POST /api/doubts/:id/replies/:replyId/upvote
// @access  Private
const upvoteReply = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const reply = doubt.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const userId = req.user._id.toString();
    const index = reply.upvotes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      reply.upvotes.push(req.user._id);
    } else {
      reply.upvotes.splice(index, 1);
    }

    await doubt.save();

    res.status(200).json({
      success: true,
      upvotesCount: reply.upvotes.length,
      hasUpvoted: index === -1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark reply as accepted answer / solved
// @route   PUT /api/doubts/:id/solve/:replyId
// @access  Private (Author or Faculty or Admin)
const markAnswerSolved = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    const isAuthor = doubt.author.toString() === req.user._id.toString();
    const isFacultyOrAdmin = req.user.role === 'faculty' || req.user.role === 'admin';

    if (!isAuthor && !isFacultyOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the author or faculty/admin can mark an answer as accepted',
      });
    }

    const reply = doubt.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    // Toggle if already accepted
    const alreadyAccepted = reply.isAcceptedAnswer;
    doubt.replies.forEach((r) => {
      r.isAcceptedAnswer = false;
    });

    if (!alreadyAccepted) {
      reply.isAcceptedAnswer = true;
      doubt.isSolved = true;
      doubt.solvedReplyId = reply._id;
    } else {
      doubt.isSolved = false;
      doubt.solvedReplyId = null;
    }

    await doubt.save();

    const populated = await Doubt.findById(doubt._id)
      .populate('author', 'name email role department avatar')
      .populate('replies.author', 'name email role department avatar');

    res.status(200).json({
      success: true,
      message: doubt.isSolved ? 'Answer accepted and marked as solved!' : 'Accepted status removed',
      doubt: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doubt
// @route   DELETE /api/doubts/:id
// @access  Private (Author or Admin)
const deleteDoubt = async (req, res, next) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ success: false, message: 'Doubt not found' });
    }

    if (req.user.role !== 'admin' && doubt.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this doubt' });
    }

    await doubt.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doubt deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoubts,
  getDoubtById,
  createDoubt,
  upvoteDoubt,
  addReply,
  upvoteReply,
  markAnswerSolved,
  deleteDoubt,
};
