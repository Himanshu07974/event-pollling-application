// controllers/invitationController.js
const { validationResult } = require('express-validator');
const invitationService = require('../services/invitationService');

// 🔹 Invite users to an event
const invite = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { eventId } = req.params;
    const { userIds, message } = req.body;
    const inviterId = req.userId;

    const result = await invitationService.inviteUsers({ eventId, inviterId, userIds, message });
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// 🔹 List invitations for logged-in user
const list = async (req, res, next) => {
  try {
    const status = req.query.status; // optional filter
    const invitations = await invitationService.listInvitations({ userId: req.userId, status });
    return res.json({ invitations });
  } catch (err) {
    next(err);
  }
};

// 🔹 Respond to an invitation (accept/decline)
const respond = async (req, res, next) => {
  try {
    const { id } = req.params; // invitation id
    const { status } = req.body; // "accepted" or "declined"
    const invitation = await invitationService.respondToInvitation({
      invitationId: id,
      userId: req.userId,
      response: status
    });
    return res.json({ invitation });
  } catch (err) {
    next(err);
  }
};

module.exports = { invite, list, respond };
