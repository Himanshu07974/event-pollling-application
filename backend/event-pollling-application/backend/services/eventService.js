const Event = require('../models/Event');

// Create Event
const createEvent = async ({ title, description, dateOptions, participants, creator }) => {
  const event = new Event({ title, description, dateOptions, participants, creator });
  await event.save();
  return event;
};

// Update Event (only creator can update)
const updateEvent = async (id, userId, updates) => {
  const event = await Event.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  if (event.creator.toString() !== userId) {
    const err = new Error('Not authorized to update this event');
    err.status = 403;
    throw err;
  }

  Object.assign(event, updates);
  await event.save();
  return event;
};

// Delete Event (only creator can delete)
const deleteEvent = async (id, userId) => {
  const event = await Event.findById(id);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }
  if (event.creator.toString() !== userId) {
    const err = new Error('Not authorized to delete this event');
    err.status = 403;
    throw err;
  }

  await event.deleteOne();
  return { message: 'Event deleted successfully' };
};

// List events created by user
const getMyEvents = async (userId) => {
  return Event.find({ creator: userId }).populate('participants', 'name email');
};

// List events user is invited to
const getInvitedEvents = async (userId) => {
  return Event.find({ participants: userId }).populate('creator', 'name email');
};

module.exports = { createEvent, updateEvent, deleteEvent, getMyEvents, getInvitedEvents };
