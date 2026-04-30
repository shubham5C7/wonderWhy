import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Signup from "./pages/signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/userSlice";
import GameRoom from "./components/GameRoom";
import WaitingRoom from "./components/WaitingRoom";
import { setupSocketListeners } from "./socketEvents";
import { socket } from "./socket/socket";  

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser());
    setupSocketListeners(socket, dispatch); 
  }, [dispatch]);
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:id"
          element={
            <ProtectedRoute>
              <WaitingRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/game/:id"
          element={
            <ProtectedRoute>
              <GameRoom />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
