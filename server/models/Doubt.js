const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
    },
    isAcceptedAnswer: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Doubt title is required'],
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isSolved: {
      type: Boolean,
      default: false,
    },
    solvedReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
  }
);

doubtSchema.index({ subject: 1, isSolved: 1, createdAt: -1 });

const Doubt = mongoose.model('Doubt', doubtSchema);
module.exports = Doubt;
