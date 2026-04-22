const Game = require("../models/model.Game");

const getHistory = async (req, res) => {
  try {
    const { roomId } = req.query; // GET /api/game?roomId=ABC123
    const filter = roomId ? { roomId } : {};
    const games = await Game.find(filter).sort({ createdAt: -1 }).limit(5);
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHistory };