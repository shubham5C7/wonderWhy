import { useEffect, useReducer } from "react";
import { socket } from "../socket/socket";
import Home from "./Home";
import { FaGamepad } from "react-icons/fa";

// Reducer
const initialState = {
  screen: "home",
  roomId: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "CREATE_ROOM_SUCCESS":
      return {
        ...state,
        roomId: action.payload,
        screen: "waiting"
      };

    case "START_GAME":
      return {
        ...state,
        screen: "game"
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const RoomPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { screen, roomId } = state;

  const handleCreateRoom = (userName) => {
    socket.emit("room:create", userName, (res) => {
      if (res.ok) {
        dispatch({
          type: "CREATE_ROOM_SUCCESS",
          payload: res.roomId
        });
      }
    });
  };

  useEffect(() => {
    const handleReady = () => {
      dispatch({ type: "START_GAME" });
    };

    socket.on("room:ready", handleReady);

    return () => {
      socket.off("room:ready", handleReady);
    };
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
          <h2 className="flex items-center justify-center gap-2">
            Game Started
            <FaGamepad className="text-green-400 text-3xl" />
          </h2>
        </div>
      )}
    </>
  );
};

export default RoomPage;