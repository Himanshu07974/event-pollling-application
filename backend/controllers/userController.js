// backend/controllers/userController.js
const User = require("../models/User");

// GET /api/users?search=term
const searchUsers = async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    if (!q) {
      // return empty array when no query (adjust if you want all users)
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    })
      .select("_id name email")
      .limit(10);

    res.json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ message: "Server error searching users" });
  }
};

module.exports = { searchUsers };
