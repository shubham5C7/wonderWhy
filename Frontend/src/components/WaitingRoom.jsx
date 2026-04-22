import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FiCopy, FiCheck, FiLogOut } from "react-icons/fi";
import { socket } from "../socket/socket";

export default function WaitingRoom() {
  const isDark     = useSelector((state) => state.theme.isDark);
  const navigate   = useNavigate();
  const { id: roomId } = useParams();

  const userName = useSelector(
    (state) =>
      state.user.user?.name ??
      state.user.user?.username ??
      state.user.user?.email
  );
  const roomStatus = useSelector((state) => state.room.status);

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    if (!roomId || !userName) return;

    // ── THE FIX ───────────────────────────────────────────────────────────
    // Register room:ready listener FIRST, then emit room:join.
    // This guarantees the listener exists before the server can fire back.
    //
    // Previously, Home.jsx emitted room:join BEFORE navigating here.
    // The server fired room:ready instantly, but WaitingRoom hadn't mounted
    // yet — so the event was missed and the user stayed stuck forever.
    //
    // Now Home.jsx only navigates (no emit). WaitingRoom always emits
    // room:join after the listener is set up, so room:ready is never missed.
    //
    // "waiting" = creator (room:create already joined them on the server).
    //             Don't emit room:join again or server sees a duplicate.
    // "idle"    = joiner navigated here from Home, or direct URL / refresh.
    //             Emit room:join now — listener is already registered above.
    // ─────────────────────────────────────────────────────────────────────

    const handleRoomReady = () => {
      navigate(`/game/${roomId}`);
    };

    // 1. Register listener FIRST
    socket.on("room:ready", handleRoomReady);

    // 2. THEN emit — so server's response is always caught
    if (roomStatus === "idle") {
      socket.emit("room:join", roomId, userName);
    }
    // roomStatus === "waiting" means creator — server already has them in the room

    return () => {
      socket.off("room:ready", handleRoomReady);
    };
  }, [roomId, userName, navigate, roomStatus]);

  return (
    <div
      className={`min-h-screen transition-all duration-300 relative ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* ROOM CODE CARD */}
      <div
        className={`absolute top-20 left-12 w-80 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all
          ${isDark ? "bg-[#0f172a]/80 border-gray-700" : "bg-white/80 border-gray-300"}`}
      >
        <label className={`block text-sm font-bold mb-2 tracking-wide ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          Room Code
        </label>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${isDark ? "bg-gray-900 border-gray-700" : "bg-gray-100 border-gray-300"}`}
        >
          <span className={`flex-1 text-4xl font-semibold tracking-widest ${isDark ? "text-white" : "text-black"}`}>
            {roomId}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center w-9 h-9 rounded-md hover:opacity-90 transition
              ${isDark ? "text-white" : "text-black"}`}
          >
            {copied ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
          </button>
        </div>
      </div>

      {/* USERNAME */}
      <div className="absolute top-20 right-12">
        <div className="relative p-[1.5px] rounded-xl bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-borderMove">
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-md
            ${isDark ? "bg-[#0f172a]/90 text-white" : "bg-white/90 text-black"}`}
          >
            <div className="relative">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold
                ${isDark ? "bg-linear-to-r from-blue-500 to-purple-500 text-white" : "bg-linear-to-r from-blue-400 to-purple-400 text-white"}`}
              >
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-black rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Playing as</span>
              <span className="text-sm font-semibold tracking-wide">{userName || "Guest"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen pt-20">
        <div className="relative flex items-center justify-center">
          <div className="ring-loader"></div>
          <img
            src="https://www.image2url.com/r2/default/images/1776809219231-abd01a1a-0174-40bd-a980-e07bed06b27b.png"
            alt="hourglass"
            className="w-50 h-30 spin-image"
          />
        </div>
        <div className="space-y-2 text-center pt-12">
          <h2 className="text-3xl font-semibold tracking-wide">
            Waiting for opponent
            <span className="dot-animation ml-1"></span>
          </h2>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-md pt-3`}>
            The game will start automatically once another player joins.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className={`absolute bottom-6 left-20 px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-md flex items-center gap-2
          ${isDark
            ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
            : "bg-white text-red-700 border border-red-900 hover:bg-red-200"
          }`}
      >
        <FiLogOut size={16} />
        Leave Room
      </button>

      <style>{`
        .ring-loader {
          position: absolute; width: 180px; height: 180px; border-radius: 50%;
          border: 3px solid transparent;
          border-top: 3px solid #3b82f6; border-right: 3px solid #3b82f6;
          animation: spinRing 1.2s linear infinite;
          box-shadow: 0 0 12px rgba(59,130,246,0.6);
        }
        @keyframes spinRing { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .dot-animation::after { content:''; animation: dots 1.5s steps(3,end) infinite; }
        @keyframes dots { 0%{content:''} 33%{content:'.'} 66%{content:'..'} 100%{content:'...'} }
        @keyframes borderMove { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        .animate-borderMove { background-size:200% 200%; animation:borderMove 3s linear infinite; }
        .spin-image { animation: spinImg 2s linear infinite; }
        @keyframes spinImg { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}