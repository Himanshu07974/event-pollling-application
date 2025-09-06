const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
// future routes: const eventRoutes = require('./eventRoutes');

router.use('/auth', authRoutes);

module.exports = router;
