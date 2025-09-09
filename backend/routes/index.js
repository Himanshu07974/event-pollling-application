const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const pollRoutes = require('./pollRoutes');
const invitationRoutes = require('./invitationRoutes');
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/polls', pollRoutes);  
router.use('/', invitationRoutes)
router.use("/users", require("./userRoutes"));
module.exports = router;
