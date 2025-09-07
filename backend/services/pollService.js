const Poll = require('../models/Poll');
const Event = require('../models/Event');

// 🔹 Create a poll for an event
const createPoll = async ({ eventId, question, options, createdBy }) => {
  // ensure event exists
  const event = await Event.findById(eventId);
  if (!event) {
    const err = new Error('Event not found');
    err.status = 404;
    throw err;
  }

  // format options: { text: "Option", votes: [] }
  const formattedOptions = options.map((opt) => ({ text: opt, votes: [] }));

  const poll = new Poll({
    event: eventId,
    question,
    options: formattedOptions,
    createdBy
  });

  await poll.save();
  return poll;
};

// 🔹 Vote on a poll option
const vote = async ({ pollId, optionIndex, userId }) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    const err = new Error('Poll not found');
    err.status = 404;
    throw err;
  }

  // remove user vote from all options (so they can only have one active vote)
  poll.options.forEach((opt) => {
    opt.votes = opt.votes.filter((voterId) => voterId.toString() !== userId.toString());
  });

  // add vote to selected option
  if (poll.options[optionIndex]) {
    poll.options[optionIndex].votes.push(userId);
  } else {
    const err = new Error('Invalid option index');
    err.status = 400;
    throw err;
  }

  await poll.save();
  return poll;
};

// 🔹 Get poll results
const getResults = async (pollId) => {
  const poll = await Poll.findById(pollId)
    .populate('options.votes', 'name email')
    .populate('createdBy', 'name email')
    .populate('event', 'title description');
  if (!poll) {
    const err = new Error('Poll not found');
    err.status = 404;
    throw err;
  }
  return poll;
};

const getPollById = async (pollId) => {
  return Poll.findById(pollId)
    .populate('createdBy', 'name email')
    .populate('options.votes', 'name email') // only if votes are refs to User
    .lean();
};
module.exports = { createPoll, vote, getResults,getPollById };
