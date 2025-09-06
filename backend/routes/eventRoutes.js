const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create Event
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('dateOptions').isArray({ min: 1 }).withMessage('At least one date option is required'),
  ],
  eventController.createEvent
);

// Update Event (creator only)
router.put('/:id', authMiddleware, eventController.updateEvent);

// Delete Event (creator only)
router.delete('/:id', authMiddleware, eventController.deleteEvent);

// List my events
router.get('/mine', authMiddleware, eventController.getMyEvents);

// List events I’m invited to
router.get('/invited', authMiddleware, eventController.getInvitedEvents);

module.exports = router;
