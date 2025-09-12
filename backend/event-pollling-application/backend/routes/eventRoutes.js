// routes/eventRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');
const invitationController = require('../controllers/invitationController');

// Defensive checks to help debug non-function handlers
console.log('▶ eventRoutes loaded');
console.log('eventController keys:', eventController && Object.keys(eventController));
console.log('typeof eventController.createEvent:', typeof (eventController && eventController.createEvent));
console.log('typeof eventController.getMyEvents:', typeof (eventController && eventController.getMyEvents));
console.log('typeof eventController.getInvitedEvents:', typeof (eventController && eventController.getInvitedEvents));
console.log('typeof eventController.getEventById:', typeof (eventController && eventController.getEventById));
console.log('typeof invitationController.invite:', typeof (invitationController && invitationController.invite));

// ----------------------
// Create Event
// POST /api/events
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('dateOptions').isArray({ min: 1 }).withMessage('At least one date option is required')
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

// Get event by ID (if creator or invitee) — KEEP THIS LAST so it doesn't shadow /mine or /invited
router.get('/:id', authMiddleware, eventController.getEventById);

module.exports = router;
