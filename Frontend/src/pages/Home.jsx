import React, { useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaPlus, FaLightbulb } from "react-icons/fa";
import { IoPeopleSharp, IoBulbOutline, IoPeopleOutline } from "react-icons/io5";
import { FiZap, FiCpu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket/socket";
import { createRoom } from "../socketEvents";
import { roomCreated, roomError, roomJoining } from "../features/roomSlice";

//  Reducer 
const initialState = {
  loading: false,
  showJoinModal: false,
  joinCode: "",
  joinError: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "OPEN_JOIN_MODAL":
      return { ...state, showJoinModal: true, joinCode: "", joinError: "" };

    case "CLOSE_JOIN_MODAL":
      return { ...state, showJoinModal: false };

    case "SET_JOIN_CODE":
      return { ...state, joinCode: action.payload };

    case "SET_JOIN_ERROR":
      return { ...state, joinError: action.payload };

    default:
      return state;
  }
}

//  Component 
export default function Home() {
  const isDark = useSelector((state) => state.theme.isDark);
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, dispatchLocal] = useReducer(reducer, initialState);
  const { loading, showJoinModal, joinCode, joinError } = state;

  const resolveUserName = () =>
    user?.name ?? user?.username ?? user?.email ?? "Player";

  // Create Room
  const handleCreateRoom = async () => {
    if (loading) return;

    dispatchLocal({ type: "SET_LOADING", payload: true });

    try {
      const userName = resolveUserName();
      const roomId = await createRoom(socket, dispatch, userName);
      dispatch(roomCreated({ roomId, userName }));
      navigate(`/room/${roomId}`);
    } catch (err) {
      dispatch(roomError(err?.message ?? String(err)));
    } finally {
      dispatchLocal({ type: "SET_LOADING", payload: false });
    }
  };

  // Join Room
  const handleJoinRoom = () => {
    const code = joinCode.trim();

    if (!code) {
      dispatchLocal({
        type: "SET_JOIN_ERROR",
        payload: "Room code is required"
      });
      return;
    }

    const userName = resolveUserName();

    dispatch(roomJoining({ roomId: code, userName }));

    dispatchLocal({ type: "CLOSE_JOIN_MODAL" });

    navigate(`/room/${code}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className={`${isDark ? "bg-gray-900" : "bg-gray-200"} w-full h-full`} />
        <IoBulbOutline className="absolute top-10 left-10 text-yellow-300 opacity-5 blur-md text-7xl" />
        <FiCpu className="absolute top-1/3 right-20 text-blue-300 opacity-5 blur-md text-8xl" style={{ strokeWidth: 1 }} />
        <IoPeopleOutline className="absolute bottom-20 left-1/4 text-gray-300 opacity-5 blur-md text-8xl" />
        <FiZap className="absolute bottom-10 right-10 text-yellow-200 opacity-5 blur-md text-7xl" style={{ strokeWidth: 1 }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center ${isDark ? "text-white" : "text-black"}`}>
        {/* Logo */}
        <div className="flex justify-center pt-16">
          <style>{`
            .logo { width: 120px; height: 120px; animation: rotateLR 8s linear infinite; transform-style: preserve-3d; }
            .logo:hover { animation: rotateLR 3s linear infinite; }
            @keyframes rotateLR {
              0% { transform: rotateY(0deg); }
              50% { transform: rotateY(180deg); }
              100% { transform: rotateY(0deg); }
            }
          `}</style>
          <img
            src="https://www.image2url.com/r2/default/images/1776801941198-7b151644-6f56-40e6-afa6-7829929b4f3e.png"
            alt="logo"
            className="logo"
          />
        </div>

        {/* Title */}
        <div className="flex justify-center items-center gap-3 mt-3 text-center">
          <h2 className="text-4xl font-bold">Welcome to</h2>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-violet-700 to-pink-600 bg-clip-text text-transparent">
            STONIX
          </h1>
        </div>

        <p className="text-sm pt-2 text-center max-w-md">
          Create a new room and invite your friends to join
        </p>

        {/* Buttons */}
        <div className="flex justify-center items-center gap-12 mt-6">
          {/* Create */}
          <button
            onClick={handleCreateRoom}
            className={`flex flex-col items-center justify-center gap-4
              w-56 h-60 rounded-xl font-semibold bg-white/5 backdrop-blur-sm
              border ${isDark ? "border-gray-500" : "border-gray-400"}
              ${isDark ? "hover:shadow-[0_0_20px_#3b82f6] hover:border-blue-400" : "hover:shadow-[0_0_20px_#ffffff] hover:border-white"}
              hover:scale-105 transition-all duration-300
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full border border-blue-500 shadow-[0_0_15px_#3b82f6]">
              <FaPlus size={26} />
            </div>
            <h2 className="text-xl font-semibold">
              {loading ? "Creating..." : "Create Room"}
            </h2>
            <p className="text-sm text-gray-400 text-center px-4">
              Create a new room and invite your friends to join
            </p>
          </button>

          {/* Join */}
          <button
            onClick={() => dispatchLocal({ type: "OPEN_JOIN_MODAL" })}
            className={`flex flex-col items-center justify-center gap-4
              w-56 h-60 rounded-xl font-semibold bg-white/5 backdrop-blur-sm
              border ${isDark ? "border-gray-500" : "border-gray-400"}
              ${isDark ? "hover:shadow-[0_0_20px_#3b82f6] hover:border-blue-400" : "hover:shadow-[0_0_20px_#ffffff] hover:border-white"}
              hover:scale-105 transition-all duration-300`}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full border border-gray-400 shadow-[0_0_15px_#9ca3af]">
              <IoPeopleSharp size={26} />
            </div>
            <h2 className="text-lg font-semibold">Join Room</h2>
            <p className="text-sm text-gray-400 text-center px-4">
              Enter a room code to join your friends game
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-6">
          <FaLightbulb className="text-yellow-400 drop-shadow-[0_0_10px_#facc15]" size={16} />
          <p className="text-xs">Play, Compete and have fun!</p>
        </div>
      </div>

      {/* Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`w-80 p-6 rounded-xl shadow-xl backdrop-blur-md
            ${isDark ? "bg-[#0f172a] text-white" : "bg-white text-black"}`}
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Join Room</h2>

            <input
              type="text"
              placeholder="Enter Room Code"
              value={joinCode}
              onChange={(e) => {
                dispatchLocal({ type: "SET_JOIN_CODE", payload: e.target.value });
                dispatchLocal({ type: "SET_JOIN_ERROR", payload: "" });
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
              className={`w-full px-4 py-2 rounded-lg border outline-none mb-2
                ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}`}
            />

            {joinError && (
              <p className="text-red-400 text-xs mb-3 text-center">{joinError}</p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => dispatchLocal({ type: "CLOSE_JOIN_MODAL" })}
                className="flex-1 py-2 rounded-lg border border-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleJoinRoom}
                className="flex-1 py-2 rounded-lg bg-blue-500 text-white"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}