const { validationResult } = require('express-validator');
const pollService = require('../services/pollService');

// 🔹 Create Poll
const createPoll = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { eventId } = req.params;
    const { question, options } = req.body;
    const createdBy = req.userId;

    const poll = await pollService.createPoll({ eventId, question, options, createdBy });

    return res.status(201).json({ poll });
  } catch (err) {
    next(err);
  }
};

// 🔹 Vote in Poll
const vote = async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.userId;

    const poll = await pollService.vote({ pollId, optionIndex, userId });

    return res.json({ poll });
  } catch (err) {
    next(err);
  }
};

// 🔹 Get Poll Results
const getResults = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await pollService.getResults(pollId);

    return res.json({ poll });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPoll, vote, getResults };
