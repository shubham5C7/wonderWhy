// socketEvents.js
// Call setupSocketListeners(socket, dispatch) once after connecting.

import { playerLeft, resetRoom } from "./features/roomSlice";

export function setupSocketListeners(socket, dispatch) {
  // Fired when opponent leaves mid-wait
  socket.on("room:player-left", (data) => {
    // data: { name }
    dispatch(playerLeft(data));
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    dispatch(resetRoom());
  });
}

//  Call this when user clicks "Create Room"
export function createRoom(socket, dispatch, userName) {
  return new Promise((resolve, reject) => {
    socket.emit("room:create", userName, (ack) => {
      if (ack?.ok) {
        resolve(ack.roomId); // caller dispatches roomCreated
      } else {
        reject(ack?.message ?? "Failed to create room");
      }
    });
  });
}

//Call this when user clicks "Leave Room"
export function leaveRoom(socket, dispatch) {
  socket.emit("room:leave");
  dispatch(resetRoom());
}