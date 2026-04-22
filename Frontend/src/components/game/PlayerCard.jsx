import React from "react";
import { TOTAL_ROUNDS } from "./constants";

function Dot({ filled, color }) {
  return (
    <span
      className="inline-block w-3.5 h-3.5 rounded-full mx-[3px] border-2 transition-all duration-300"
      style={{
        backgroundColor: filled ? color : "transparent",
        borderColor: color,
        boxShadow: filled ? `0 0 10px ${color}, 0 0 20px ${color}` : "none",
      }}
    />
  );
}

export default function PlayerCard({ name, isMe, score }) {
  const color = isMe ? "#22d3ee" : "#ec4899";

  const bgGrad = isMe
    ? "bg-gradient-to-r from-cyan-500/10 to-cyan-500/0"
    : "bg-gradient-to-l from-pink-500/10 to-pink-500/0";

  return (
    <div
      className={`flex-1 relative overflow-hidden rounded-2xl border p-4 shadow-lg ${bgGrad}`}
      style={{
        borderColor: isMe
          ? "rgba(34,211,238,0.5)"
          : "rgba(236,72,153,0.5)",
        boxShadow: `0 0 30px ${color}22, inset 0 1px 0 ${color}22`,
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute top-0 w-32 h-32 rounded-full pointer-events-none"
        style={{
          [isMe ? "left" : "right"]: 0,
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        }}
      />

      {/* Main row */}
      <div
        className={`relative z-10 flex items-center gap-6 ${
          isMe ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg"
            style={{
              background: isMe
                ? "linear-gradient(135deg,#3b82f6,#22d3ee)"
                : "linear-gradient(135deg,#7c3aed,#ec4899)",
              boxShadow: `0 0 20px ${color}66, 0 0 40px ${color}33`,
            }}
          >
            {name ? name.charAt(0).toUpperCase() : "?"}
          </div>

          {/* Online dot */}
          <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#0b1220] shadow-[0_0_8px_#4ade80]" />
        </div>

        {/* Info */}
        <div className={isMe ? "text-left" : "text-right"}>
          <div
            className="inline-block text-[10px] font-extrabold px-2 py-[2px] rounded-md mb-1 tracking-widest text-white"
            style={{
              backgroundColor: isMe ? "#0891b2" : "#be185d",
            }}
          >
            {isMe ? "YOU" : "OPPONENT"}
          </div>

          <div className="text-xl font-black text-white leading-tight">
            {name || "Waiting..."}
          </div>

        </div>
      </div>

      {/* Score dots */}
      <div
        className={`mt-3 flex gap-[2px] relative z-10 ${
          isMe ? "justify-start" : "justify-end"
        }`}
      >
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <Dot key={i} filled={i < score} color={color} />
        ))}
      </div>
    </div>
  );
}