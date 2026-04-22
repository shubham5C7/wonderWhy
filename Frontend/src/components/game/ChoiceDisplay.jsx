import React from "react";
import { CHOICES } from "./constants";

export default function ChoiceDisplay({
  choiceKey,
  label,
  isRevealed,
  color,
  isDark,
}) {
  const found = CHOICES.find((c) => c.key === choiceKey);
  const icon = found?.icon;

  const isMe = color === "#22d3ee";

  const cardBg = isDark ? "bg-slate-900/90" : "bg-white/90";
  const cardBorder = isDark ? "border-white/10" : "border-gray-200";
  const statusText = isDark ? "text-slate-400" : "text-gray-500";

  return (
    <div
      className={`flex-1 max-w-[220px] rounded-2xl border ${cardBorder} ${cardBg} p-5 flex flex-col items-center gap-3 shadow-lg transition-colors duration-300`}
      style={{
        boxShadow: `0 0 24px ${color}18`,
      }}
    >
      {/* Label */}
      <span
        className="text-[10px] font-extrabold tracking-widest font-mono"
        style={{ color }}
      >
        {label}
      </span>

      {/* Circle */}
      <div
        className="w-[180px] h-[220px] rounded-full flex items-center justify-center transition-all duration-500"
        style={{
          border: isRevealed
            ? `2px dashed ${color}`
            : isDark
            ? "2px dashed rgba(100,116,139,0.5)"
            : "2px dashed rgba(156,163,175,0.6)",
          background: isRevealed ? `${color}11` : "transparent",
          boxShadow: isRevealed
            ? `0 0 30px ${color}55, 0 0 60px ${color}22`
            : "none",
        }}
      >
        {isRevealed ? (
          <img
            src={icon}
            alt={choiceKey}
            className="w-24 h-24 object-contain"
          />
        ) : (
          <span className="text-3xl opacity-40" style={{ color }}>
            ?
          </span>
        )}
      </div>

      {/* Status text */}
      <p className={`text-[11px] ${statusText} m-0 text-center`}>
        {isRevealed
          ? "Locked in!"
          : isMe
          ? "Waiting for move..."
          : "Waiting for opponent..."}
      </p>
    </div>
  );
}