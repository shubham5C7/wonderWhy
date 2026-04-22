import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/userSlice";
import themeReducer from "../features/themeSlice";
import roomReducer from "../features/roomSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    theme: themeReducer,
    room: roomReducer,
  },
});