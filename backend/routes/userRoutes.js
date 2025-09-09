const express = require("express");
const router = express.Router();
const { searchUsers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// search for users by name/email
router.get("/", authMiddleware, searchUsers);

module.exports = router;
