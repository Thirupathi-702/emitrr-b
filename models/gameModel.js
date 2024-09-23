// models/GameAction.js
const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cardCount: {
    type: Number,
    required: true,
  },
  defuseCards: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("Game", gameSchema);
