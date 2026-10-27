const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc    Submit assignment (file upload)
// @route   POST /api/submissions/:assignmentId
// @access  Student
const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { notes } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file for the assignment submission',
      });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const isLate = new Date() > new Date(assignment.deadline);

    // Check if submission already exists (update it)
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    if (submission) {
      submission.fileUrl = fileUrl;
      submission.fileName = fileName;
      submission.fileSize = fileSize;
      submission.notes = notes || submission.notes;
      submission.submittedAt = new Date();
      submission.status = isLate ? 'late' : 'submitted';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignmentId,
        student: req.user._id,
        fileUrl,
        fileName,
        fileSize,
        notes: notes || '',
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate('assignment', 'title subject deadline maxMarks')
      .populate('student', 'name email rollNumber');

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (marked as Late)' : 'Assignment submitted successfully',
      submission: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission (Faculty / Admin)
// @route   PUT /api/submissions/:submissionId/grade
// @access  Faculty / Admin
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { marksObtained, feedback } = req.body;

    if (marksObtained === undefined || marksObtained === null) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained is required',
      });
    }

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const numericMarks = Number(marksObtained);
    if (numericMarks < 0 || numericMarks > submission.assignment.maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${submission.assignment.maxMarks}`,
      });
    }

    submission.marksObtained = numericMarks;
    submission.feedback = feedback !== undefined ? feedback.trim() : submission.feedback;
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    submission.status = 'graded';

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('student', 'name email rollNumber')
      .populate('gradedBy', 'name email')
      .populate('assignment', 'title subject maxMarks');

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for current student
// @route   GET /api/submissions/my
// @access  Student
const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate('assignment', 'title subject deadline maxMarks')
      .populate('gradedBy', 'name email')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitAssignment,
  gradeSubmission,
  getMySubmissions,
};
