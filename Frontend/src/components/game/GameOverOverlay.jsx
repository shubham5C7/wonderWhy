import React from "react";

export default function GameOverOverlay({ winner, myName, onRematch, onLeave }) {
  const isWin = winner === myName;
  const isTie = !winner;

  const color = isTie ? "#facc15" : isWin ? "#22d3ee" : "#ec4899";

  const emoji = isTie ? "🤝" : isWin ? "🏆" : "💀";

  const title = isTie ? "IT'S A TIE!" : isWin ? "YOU WIN!" : "YOU LOSE!";

  const sub = isTie
    ? "Great minds think alike"
    : isWin
    ? "Flawless victory!"
    : `${winner} wins this time`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-sm mx-4 rounded-3xl border text-center p-10 shadow-2xl"
        style={{
          borderColor: `${color}44`,
          boxShadow: `0 0 80px ${color}44, 0 0 160px ${color}22`,
          background: "linear-gradient(135deg,#0b1220,#0d1929)",
        }}
      >
        {/* Emoji */}
        <div className="text-7xl mb-4">{emoji}</div>

        {/* Title */}
        <h2
          className="text-3xl font-black tracking-widest mb-2"
          style={{
            color,
            textShadow: `0 0 30px ${color}`,
            fontFamily: "'Orbitron', monospace",
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-400 mb-8">{sub}</p>

        {/* Buttons */}
        <div className="flex gap-3">
          {/* Leave */}
          <button
            onClick={onLeave}
            className="flex-1 text-xl py-3 rounded-xl border border-gray-500 bg-red-400 text-white font-bold tracking-widest hover:bg-red-500/20 transition"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            LEAVE
          </button>

          {/* Rematch */}
          <button
            onClick={onRematch}
            className="flex-1 py-3 rounded-xl font-bold tracking-widest text-white bg-green-600  shadow-lg hover:opacity-85 transition"
            style={{ fontFamily: "'Orbitron', monospace" }}
          >
            REMATCH
          </button>
        </div>
      </div>
    </div>
  );
}