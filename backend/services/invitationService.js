// services/invitationService.js
const Invitation = require('../models/Invitation');
const Event = require('../models/Event');
const User = require('../models/User');

const inviteUsers = async ({ eventId, inviterId, userIds = [], message = '' }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  if (event.creator.toString() !== inviterId.toString()) {
    const err = new Error('Not authorized to invite users to this event');
    err.status = 403;
    throw err;
  }

  const results = [];

  for (const uid of userIds) {
    const user = await User.findById(uid);
    if (!user) {
      results.push({ userId: uid, status: 'user_not_found' });
      continue;
    }

    // avoid duplicate pending invites
    const existing = await Invitation.findOne({ event: eventId, to: uid, status: 'pending' });
    if (existing) {
      results.push({ userId: uid, status: 'already_invited', invitationId: existing._id });
      continue;
    }

    const invite = new Invitation({
      event: eventId,
      from: inviterId,
      to: uid,
      message,
      status: 'pending'
    });

    await invite.save();

    // add to event.participants if not already there
    if (!event.participants.map(String).includes(String(uid))) {
      event.participants.push(uid);
    }

    results.push({ userId: uid, status: 'invited', invitationId: invite._id });
  }

  await event.save();
  return { eventId, invites: results };
};

/**
 * listInvitations for a user (with optional status filter)
 */
const listInvitations = async ({ userId, status }) => {
  const q = { to: userId };
  if (status) q.status = status;
  return Invitation.find(q)
    .populate('event', 'title description creator')
    .populate('from', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * respondToInvitation: accept or decline
 */
const respondToInvitation = async ({ invitationId, userId, response }) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    const err = new Error('Invitation not found');
    err.status = 404;
    throw err;
  }
  if (invitation.to.toString() !== userId.toString()) {
    const err = new Error('Not authorized to respond to this invitation');
    err.status = 403;
    throw err;
  }

  if (!['accepted', 'declined'].includes(response)) {
    const err = new Error('Invalid response');
    err.status = 400;
    throw err;
  }

  invitation.status = response;
  invitation.read = true;
  await invitation.save();

  // ensure event.participants contains user if accepted
  const event = await Event.findById(invitation.event);
  if (!event) {
    // odd case: event deleted; return invitation anyway
    return invitation;
  }

  if (response === 'accepted') {
    if (!event.participants.map(String).includes(String(userId))) {
      event.participants.push(userId);
      await event.save();
    }
  } else {
    // on decline: remove user from participants (optional policy)
    event.participants = event.participants.filter(p => p.toString() !== userId.toString());
    await event.save();
  }

  return invitation;
};

module.exports = { inviteUsers, listInvitations, respondToInvitation };
