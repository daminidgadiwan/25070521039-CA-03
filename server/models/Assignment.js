const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    department: {
      type: String,
      default: 'Computer Science & Engineering',
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ subject: 1, deadline: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);
module.exports = Assignment;
