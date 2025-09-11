// backend/controllers/eventController.js
const { validationResult } = require('express-validator');
const eventService = require('../services/eventService');
const Event = require('../models/Event');

/**
 * Helper to get requester id from different possible middleware shapes.
 */
const getRequesterId = (req) => {
  // many middlewares put payload in req.user.id, some use req.userId, some req.user._id
  return (req.user && (req.user.id || req.user._id)) || req.userId || null;
};

// Create Event
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, dateOptions, participants = [] } = req.body;
    const creator = getRequesterId(req);

    if (!creator) return res.status(401).json({ message: 'Authentication required' });

    const event = await eventService.createEvent({ title, description, dateOptions, participants, creator });
    return res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

// Update Event (creator only)
const updateEvent = async (req, res, next) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Authentication required' });

    const eventId = req.params.id;
    // service should validate creator permission, but double-check here as well
    const updated = await eventService.updateEvent(eventId, requesterId, req.body);
    return res.json({ event: updated });
  } catch (err) {
    next(err);
  }
};

// Delete Event (creator only)
const deleteEvent = async (req, res, next) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Authentication required' });

    const eventId = req.params.id;
    const result = await eventService.deleteEvent(eventId, requesterId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

// Get events the user created
const getMyEvents = async (req, res, next) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Authentication required' });

    const events = await eventService.getMyEvents(requesterId);
    return res.json({ events });
  } catch (err) {
    next(err);
  }
};

// Get events user is invited to / participant of
const getInvitedEvents = async (req, res, next) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Authentication required' });

    const events = await eventService.getInvitedEvents(requesterId);
    return res.json({ events });
  } catch (err) {
    next(err);
  }
};

// Get single event by id (creator or participant only)
const getEventById = async (req, res) => {
  try {
    const requesterId = getRequesterId(req);
    if (!requesterId) return res.status(401).json({ message: 'Authentication required' });

    const eventId = req.params.id;
    if (!eventId) return res.status(400).json({ message: 'Event id required' });

    const event = await Event.findById(eventId)
      .populate('participants', '_id name email')
      .populate('creator', '_id name email')
      .lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    const isCreator = event.creator && String(event.creator._id) === String(requesterId);
    const isParticipant = Array.isArray(event.participants) && event.participants.some(p => String(p._id) === String(requesterId));

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }

    return res.json({ event });
  } catch (err) {
    console.error('Error in getEventById:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getInvitedEvents,
  getEventById,
};
