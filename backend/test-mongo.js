// backend/test-mongo.js
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb+srv://mannu323234_db_user:rMmSfdXT4UN5dzwp@cluster0.cncpgwk.mongodb.net/event-polling-app?retryWrites=true&w=majority';

(async () => {
  try {
    await mongoose.connect(uri, {
      // small options for debugging
      serverSelectionTimeoutMS: 10000,
      // tls options only for debugging; remove for production
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log('Connected OK');
    process.exit(0);
  } catch (err) {
    console.error('Connect error:', err);
    if (err && err.stack) console.error(err.stack);
    process.exit(1);
  }
})();
