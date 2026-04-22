import { createSlice } from "@reduxjs/toolkit";

// Shape:
// {
//   roomId: "FU4KP6" | null,
//   userName: "shubham" | null,
//   players: [{ name, socketId }],
//   status: "idle" | "waiting" | "ready",
//   error: string | null,
// }

const initialState = {
  roomId: null,
  userName: null,
  players: [],
  status: "idle",
  error: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    // ── Called after socket "room:create" ack returns { ok: true, roomId }
    roomCreated(state, action) {
      const { roomId, userName } = action.payload;
      state.roomId = roomId;
      state.userName = userName;
      state.status = "waiting";
      state.players = [{ name: userName, socketId: null }]; // host
      state.error = null;
    },

    // ── Called when socket emits "room:ready" → both players joined
    roomReady(state, action) {
      // payload: { roomId, players: [{ name, socketId }] }
      state.players = action.payload.players;
      state.status = "ready";
    },

    // ── Called when socket emits "room:player-left"
    playerLeft(state, action) {
      // payload: { name }
      state.players = state.players.filter(
        (p) => p.name !== action.payload.name,
      );
      state.status = "waiting";
    },

    // ── Called on error (room not found, full, etc.)
    roomError(state, action) {
      state.error = action.payload;
    },

    // ── Reset on leave / disconnect
    resetRoom() {
      return initialState;
    },

    // Add this to reducers:
    roomJoining(state, action) {
      const { roomId, userName } = action.payload;
      state.roomId = roomId;
      state.userName = userName;
      state.status = "idle"; // ← "idle" so WaitingRoom emits room:join
      state.players = [];
      state.error = null;
    },
  },
});

export const { roomCreated, roomReady, playerLeft, roomError, resetRoom,roomJoining } =
  roomSlice.actions;

export default roomSlice.reducer;
