const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
const getAssignments = async (req, res, next) => {
  try {
    const { subject, department } = req.query;
    const filter = {};
    if (subject) filter.subject = new RegExp(subject, 'i');
    if (department) filter.department = department;

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'name email role department')
      .sort({ deadline: 1 });

    // If requester is a student, attach their submission status for each assignment
    if (req.user && req.user.role === 'student') {
      const studentSubmissions = await Submission.find({ student: req.user._id });
      const submissionMap = {};
      studentSubmissions.forEach((sub) => {
        submissionMap[sub.assignment.toString()] = sub;
      });

      const enrichedAssignments = assignments.map((assign) => {
        const obj = assign.toObject();
        const mySub = submissionMap[assign._id.toString()];
        obj.submission = mySub || null;
        obj.isSubmitted = !!mySub;
        obj.isGraded = !!(mySub && mySub.marksObtained !== null);
        return obj;
      });

      return res.status(200).json({
        success: true,
        count: enrichedAssignments.length,
        assignments: enrichedAssignments,
      });
    }

    // For faculty / admin, also calculate submission counts
    const assignmentIds = assignments.map((a) => a._id);
    const submissionCounts = await Submission.aggregate([
      { $match: { assignment: { $in: assignmentIds } } },
      { $group: { _id: '$assignment', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    submissionCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const enrichedAssignments = assignments.map((assign) => {
      const obj = assign.toObject();
      obj.totalSubmissions = countMap[assign._id.toString()] || 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      count: enrichedAssignments.length,
      assignments: enrichedAssignments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignment by ID with submissions
// @route   GET /api/assignments/:id
// @access  Private
const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email role department');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const result = assignment.toObject();

    if (req.user.role === 'student') {
      const mySubmission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      }).populate('gradedBy', 'name email');
      result.mySubmission = mySubmission;
    } else {
      // Faculty or Admin sees all submissions
      const submissions = await Submission.find({ assignment: assignment._id })
        .populate('student', 'name email rollNumber department avatar')
        .populate('gradedBy', 'name email')
        .sort({ submittedAt: -1 });
      result.submissions = submissions;
    }

    res.status(200).json({
      success: true,
      assignment: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Faculty / Admin
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subject, department, deadline, maxMarks } = req.body;

    if (!title || !description || !subject || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, subject, and deadline are required',
      });
    }

    let attachmentUrl = '';
    let attachmentName = '';
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentName = req.file.originalname;
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      department: department || req.user.department || 'Computer Science & Engineering',
      deadline: new Date(deadline),
      maxMarks: Number(maxMarks) || 100,
      attachmentUrl,
      attachmentName,
      createdBy: req.user._id,
    });

    const populated = await Assignment.findById(assignment._id).populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Faculty / Admin
const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this assignment' });
    }

    const { title, description, subject, department, deadline, maxMarks } = req.body;
    if (title) assignment.title = title.trim();
    if (description) assignment.description = description.trim();
    if (subject) assignment.subject = subject.trim();
    if (department) assignment.department = department;
    if (deadline) assignment.deadline = new Date(deadline);
    if (maxMarks) assignment.maxMarks = Number(maxMarks);

    if (req.file) {
      assignment.attachmentUrl = `/uploads/${req.file.filename}`;
      assignment.attachmentName = req.file.originalname;
    }

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Faculty / Admin
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
    }

    // Cascade delete submissions
    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Assignment and related submissions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
