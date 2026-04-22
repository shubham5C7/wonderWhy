const mongoose = require("mongoose");

// each round inside a game
const roundSchema = new mongoose.Schema({
  roundNumber: Number,
  p1Choice: String,
  p2Choice: String,
  winner: {
    type: String,
    enum: ["p1", "p2", "draw"],
  },
});

// main game schema
const gameSchema = new mongoose.Schema({
  roomId: String,

  players: [
    {
      type: String,
    },
  ],

  rounds: [roundSchema], // embedded rounds

  finalWinner: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Game", gameSchema);