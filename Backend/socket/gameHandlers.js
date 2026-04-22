const { getRoom } = require("../store/rooms");
const { getWinner } = require("../utils/gameLogic");
const Game = require("../models/model.Game");

const TOTAL_ROUNDS = 6;

function handleGameChoice(socket, io) {
  return async (choice, ack) => {
    const room = getRoom(socket.data.roomId);
    if (!room) return ack?.({ ok: false, message: "Not in a room" });

    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return ack?.({ ok: false, message: "Player not found" });

    const VALID = ["rock", "paper", "scissors"];
    if (!VALID.includes(choice)) return ack?.({ ok: false, message: "Invalid choice" });

    player.choice = choice;
    socket.to(room.roomId).emit("game:opponent-chose");
    ack?.({ ok: true });

    if (room.players.every((p) => p.choice)) {
      const [p1, p2] = room.players;
      const result = getWinner(p1.choice, p2.choice); // "p1" | "p2" | "draw"

      room.roundCount++;
      room.rounds.push({ p1: p1.choice, p2: p2.choice, result });

      if (result === "p1") room.scores[0]++;
      if (result === "p2") room.scores[1]++;

      const roundWinner =
        result === "p1" ? p1.name : result === "p2" ? p2.name : null;

      io.to(room.roomId).emit("game:result", {
        players: [
          { name: p1.name, choice: p1.choice },
          { name: p2.name, choice: p2.choice },
        ],
        winner: roundWinner,
      });

      room.players.forEach((p) => (p.choice = null));

      if (room.roundCount === TOTAL_ROUNDS) {
        const finalWinner =
          room.scores[0] > room.scores[1]
            ? p1.name
            : room.scores[1] > room.scores[0]
            ? p2.name
            : null;

        //  Delay matches frontend's 2000ms result display + 200ms buffer
        setTimeout(() => {
          io.to(room.roomId).emit("game:over", { winner: finalWinner });
        }, 2200);

        // Save to DB
        try {
          await Game.create({
            roomId: room.roomId,
            players: [p1.name, p2.name],
            rounds: room.rounds.map((r, i) => ({
              roundNumber: i + 1,
              p1Choice: r.p1,
              p2Choice: r.p2,
              winner: r.result,
            })),
            finalWinner: finalWinner ?? "draw",
          });
          console.log(`✅ Game saved: ${room.roomId}`);
        } catch (err) {
          console.error("❌ DB save failed:", err.message);
        }
      }
    }
  };
}

//  both players must emit game:rematch
function handleRematch(socket, io) {
  return () => {
    const room = getRoom(socket.data.roomId);
    if (!room) return;

    // Track votes
    if (!room.rematchVotes) room.rematchVotes = new Set();
    room.rematchVotes.add(socket.id);

    if (room.rematchVotes.size === 2) {
      // Reset room state
      room.roundCount = 0;
      room.rounds = [];
      room.scores = [0, 0];
      room.rematchVotes.clear();
      room.players.forEach((p) => (p.choice = null));

      io.to(room.roomId).emit("game:rematch-start", {
        players: room.players.map((p) => ({
          name: p.name,
          socketId: p.socketId,
        })),
      });
    }
  };
}

module.exports = { handleGameChoice, handleRematch };