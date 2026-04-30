const { getRoom } = require("../store/rooms");
const { getWinner } = require("../utils/gameLogic");
const { pool } = require("../config/db"); // PostgreSQL connection pool

// Total round per game
const TOTAL_ROUNDS = 6;

// When player makes a choices (rock/paper/scissors)
function handleGameChoice(socket, io) {
  return async (choice, ack) => {

    // Get the room using sockets roomId
    const room = getRoom(socket.data.roomId);
    if (!room) return ack?.({ ok: false, message: "Not in a room" });

    // Find current players in the room
    const player = room.players.find((p) => p.socketId === socket.id);
    if (!player) return ack?.({ ok: false, message: "Player not found" });

    // Validations user Inputs
    const VALID = ["rock", "paper", "scissors"];
    if (!VALID.includes(choice)) return ack?.({ ok: false, message: "Invalid choice" });

    // Save players choise
    player.choice = choice;

    // Notify opponnets that this player has made a move
    socket.to(room.roomId).emit("game:opponent-chose");
    // Acknowledge successful choise to client
    ack?.({ ok: true });

    // Check if both players have have made there choice
    if (room.players.every((p) => p.choice)) {
      const [p1, p2] = room.players;
        // Determine winner of the round
      const result = getWinner(p1.choice, p2.choice); // "p1" | "p2" | "draw"

        // Increment round count and store round history
      room.roundCount++;
      room.rounds.push({ p1: p1.choice, p2: p2.choice, result });
 // Update scores based on result
      if (result === "p1") room.scores[0]++;
      if (result === "p2") room.scores[1]++;
  // Convert result to player name null if draw.
      const roundWinner =
        result === "p1" ? p1.name : result === "p2" ? p2.name : null;

        // Send round result to all players in the room
      io.to(room.roomId).emit("game:result", {
        players: [
          { name: p1.name, choice: p1.choice },
          { name: p2.name, choice: p2.choice },
        ],
        winner: roundWinner,
      });
  // Reset choices for next round
      room.players.forEach((p) => (p.choice = null));
 // Check if game has reached final round
      if (room.roundCount === TOTAL_ROUNDS) {
        // Determine overall game winner
        const finalWinner =
          room.scores[0] > room.scores[1]
            ? p1.name
            : room.scores[1] > room.scores[0]
            ? p2.name
            : null;

        // Emit game over event after short delay (for UI smoothness)
        setTimeout(() => {
          io.to(room.roomId).emit("game:over", { winner: finalWinner });
        }, 2200);

          // Save game result into PostgreSQL database
        try {
          await pool.query(
            "INSERT INTO games(room_id, status, winner) VALUES ($1, $2, $3)",
            [room.roomId, "finished", finalWinner ?? "draw"]
          );
         console.log(`Game saved: ${room.roomId}`);
        } catch (err) {
          console.error("DB save failed:", err.message);
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