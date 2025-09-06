const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pollSchema = new Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true }, // linked event
    question: { type: String, required: true }, // e.g. "Which date works best?"
    options: [
      {
        text: { type: String, required: true }, // e.g. "2025-09-10 10:00"
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // users who voted for this option
      }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // creator of poll
  },
  { timestamps: true }
);

module.exports = mongoose.model('Poll', pollSchema);
