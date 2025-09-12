const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const signup = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashed
  });

  await user.save();

  const token = signToken({ id: user._id });

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken({ id: user._id });

  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const getUserById = async (id) => {
  return User.findById(id).select('-password').lean();
};

module.exports = { signup, login, getUserById };
