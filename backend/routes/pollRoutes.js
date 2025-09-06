const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const pollController = require('../controllers/pollController');
const authMiddleware = require('../middlewares/authMiddleware');


// Create poll for an event
// POST /api/polls/:eventId
router.post(
  '/:eventId',
  authMiddleware,
  [
    body('question').notEmpty().withMessage('Question is required'),
    body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  ],
  pollController.createPoll
);

// Vote on a poll
// POST /api/polls/:pollId/vote
router.post(
  '/:pollId/vote',
  authMiddleware,
  [
    body('optionIndex').isInt({ min: 0 }).withMessage('optionIndex must be a non-negative integer')
  ],
  pollController.vote
);

// Get poll results
// GET /api/polls/:pollId/results
router.get('/:pollId/results', authMiddleware, pollController.getResults);

module.exports = router;
