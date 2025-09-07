// routes/invitationRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const invitationController = require('../controllers/invitationController');

// 🔹 List invitations for the logged-in user
// GET /api/invitations
router.get('/invitations', authMiddleware, invitationController.list);

// 🔹 Respond to an invitation (accept/decline)
// POST /api/invitations/:id/respond
router.post(
  '/invitations/:id/respond',
  authMiddleware,
  [
    body('status')
      .isIn(['accepted', 'declined'])
      .withMessage('status must be accepted or declined'),
  ],
  invitationController.respond
);

module.exports = router;
