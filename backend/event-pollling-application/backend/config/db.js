// config/db.js
const mongoose = require('mongoose');

const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri || typeof uri !== 'string') {
    throw new Error('MONGO_URI is not defined. Check .env or environment config');
  }

  // options removed for mongoose v6+ (they are default)
  await mongoose.connect(uri);
  return mongoose;
};

module.exports = connectDb;
