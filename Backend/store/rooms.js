const rooms = {};

function createRoom(roomId, firstPlayer) {
  rooms[roomId] = {
    roomId,
    players: [firstPlayer],
    status: "waiting",
    roundCount: 0,
    rounds: [],
    scores: [0, 0],
    rematchVotes: new Set(),
  };
}

function getRoom(roomId) {
  return rooms[roomId] || null;
}

function deleteRoom(roomId) {
  delete rooms[roomId];
}

module.exports = { createRoom, getRoom, deleteRoom };