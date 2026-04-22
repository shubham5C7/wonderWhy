const { createRoom, getRoom, deleteRoom } = require("../store/rooms");
const { generateRoomId } = require("../utils/room");

function handleCreateRoom(socket) {
  return (userName, ack) => {
    const roomId = generateRoomId();

    createRoom(roomId, {
      socketId: socket.id,
      name: userName,
      choice: null,
    });

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = userName;

    ack?.({ ok: true, roomId });
  };
}

function handleJoinRoom(socket, io) {
  return (roomId, userName, ack) => {
    const room = getRoom(roomId);

    if (!room) return ack?.({ ok: false, message: "Room not found" });
    if (room.players.length >= 2) return ack?.({ ok: false, message: "Room full" });

    room.players.push({ socketId: socket.id, name: userName, choice: null });
    room.status = "ready";

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.name = userName;

    io.to(roomId).emit("room:ready", { players: room.players });
    ack?.({ ok: true });
  };
}


function handleLeaveRoom(socket, io) {
  return () => {
    const roomId = socket.data.roomId;
    const room = getRoom(roomId);
    if (!room) return;

    const leavingName = socket.data.name;
    socket.to(roomId).emit("room:player-left", { name: leavingName });
    socket.leave(roomId);
    deleteRoom(roomId);
  };
}

module.exports = { handleCreateRoom, handleJoinRoom, handleLeaveRoom };