const express = require('express');
const router = express.Router();
const {
  getDoubts,
  getDoubtById,
  createDoubt,
  upvoteDoubt,
  addReply,
  upvoteReply,
  markAnswerSolved,
  deleteDoubt,
} = require('../controllers/doubtController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', authenticate, getDoubts);
router.get('/:id', authenticate, getDoubtById);
router.post('/', authenticate, createDoubt);
router.post('/:id/upvote', authenticate, upvoteDoubt);
router.post('/:id/replies', authenticate, addReply);
router.post('/:id/replies/:replyId/upvote', authenticate, upvoteReply);
router.put('/:id/solve/:replyId', authenticate, markAnswerSolved);
router.delete('/:id', authenticate, deleteDoubt);

module.exports = router;
