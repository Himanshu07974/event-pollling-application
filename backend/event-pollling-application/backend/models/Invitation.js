const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invitationSchema = new Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Ensure the model is exported exactly once
module.exports = mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
