// backend/controllers/userController.js
const User = require("../models/User");

const searchUsers = async (req, res) => {
  try {
    const q = (req.query.search || "").trim();
    if (!q) return res.json({ users: [] });

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
