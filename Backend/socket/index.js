const { handleCreateRoom, handleJoinRoom, handleLeaveRoom } = require("../socket/roomHandlers");
const { handleGameChoice, handleRematch } = require("../socket/gameHandlers");

function setupSocket(io) {
  io.on("connection", (socket) => {
    socket.on("room:create", handleCreateRoom(socket));
    socket.on("room:join",   handleJoinRoom(socket, io));
    socket.on("game:choice", handleGameChoice(socket, io));
    socket.on("game:rematch", handleRematch(socket, io)); 
    socket.on("room:leave",  handleLeaveRoom(socket, io)); 
  });
}

module.exports = { setupSocket };