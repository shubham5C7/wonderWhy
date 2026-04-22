import { useState, useEffect } from "react";
import { socket } from "../socket/socket";
import Home from "./Home";

const RoomPage = () => {
  const [screen, setScreen] = useState("home");
  const [roomId, setRoomId] = useState("");

  const handleCreateRoom = (userName) => {
    socket.emit("room:create", userName, (res) => {
      if (res.ok) {
        setRoomId(res.roomId);
        setScreen("waiting");
      }
    });
  };

  useEffect(() => {
    socket.on("room:ready", () => {
      setScreen("game");
    });

    return () => socket.off("room:ready");
  }, []);

  return (
    <>
      {screen === "home" && (
        <Home onCreateRoom={handleCreateRoom} />
      )}

      {screen === "waiting" && (
        <div className="text-center mt-20 text-white">
          <h2 className="text-3xl">Room ID: {roomId}</h2>
          <p>Waiting for opponent...</p>
        </div>
      )}

      {screen === "game" && (
        <div className="text-center mt-20 text-white">
          <h2>Game Started 🎮</h2>
        </div>
      )}
    </>
  );
};

export default RoomPage;