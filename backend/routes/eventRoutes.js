// routes/eventRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const invitationController = require('../controllers/invitationController');

console.log('▶ eventRoutes loaded');

// ----------------------
// Create Event
// POST /api/events
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('dateOptions').isArray({ min: 1 }).withMessage('At least one date option is required'),
    // participants optional
  ],
  eventController.createEvent
);

// Invite users to an event (creator only)
// POST /api/events/:eventId/invite
router.post(
  '/:eventId/invite',
  authMiddleware,
  [
    body('userIds').isArray({ min: 1 }).withMessage('userIds array is required'),
    body('message').optional().isString()
  ],
  invitationController.invite
);

// Update Event (creator only)
// PUT /api/events/:id
router.put('/:id', authMiddleware, eventController.updateEvent);

// Delete Event (creator only)
// DELETE /api/events/:id
router.delete('/:id', authMiddleware, eventController.deleteEvent);

// List my events
// GET /api/events/mine
router.get('/mine', authMiddleware, eventController.getMyEvents);

// List events I’m invited to
// GET /api/events/invited
router.get('/invited', authMiddleware, eventController.getInvitedEvents);

module.exports = router;
