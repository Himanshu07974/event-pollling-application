const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const eventRoutes = require('./eventRoutes');
const pollRoutes = require('./pollRoutes');
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/polls', pollRoutes);  
module.exports = router;
