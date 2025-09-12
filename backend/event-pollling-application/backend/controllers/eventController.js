const { validationResult } = require('express-validator');
const eventService = require('../services/eventService');
const Event = require('../models/Event');
// Create Event
const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, dateOptions, participants } = req.body;
    const creator = req.userId;

    const event = await eventService.createEvent({ title, description, dateOptions, participants, creator });
    return res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

// Update Event
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.userId, req.body);
    return res.json({ event });
  } catch (err) {
    next(err);
  }
};

// Delete Event
const deleteEvent = async (req, res, next) => {
  try {
    const result = await eventService.deleteEvent(req.params.id, req.userId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

// My Events
const getMyEvents = async (req, res, next) => {
  try {
    const events = await eventService.getMyEvents(req.userId);
    return res.json({ events });
  } catch (err) {
    next(err);
  }
};

// Invited Events
const getInvitedEvents = async (req, res, next) => {
  try {
    const events = await eventService.getInvitedEvents(req.userId);
    return res.json({ events });
  } catch (err) {
    next(err);
  }
};



module.exports = { createEvent, updateEvent, deleteEvent, getMyEvents, getInvitedEvents };
