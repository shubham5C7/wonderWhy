import React from "react";
import { CHOICES } from "./constants";
import { useSelector } from "react-redux";

const resultStyle = {
  win: "#4ade80",
  lose: "#f87171",
  tie: "#facc15",
  pending: "#64748b",
};

export default function HistoryCard({ round, data}) {
    const isDark = useSelector((state) => state.theme.isDark);
  const myIcon =
    CHOICES.find((c) => c.key === data?.p1Choice)?.icon;
  const oppIcon =
    CHOICES.find((c) => c.key === data?.p2Choice)?.icon;

  const result = data?.result || "pending";
  const color = resultStyle[result] || resultStyle.pending;

  const label =
    result === "win"
      ? "You Won"
      : result === "lose"
      ? "You Lost"
      : result === "tie"
      ? "Tie"
      : "Pending";


  const bg = isDark ? "bg-gray-900/70" : "bg-white";
  const border = isDark ? "border-gray-700" : "border-gray-200";
  const roundText = isDark ? "text-gray-400" : "text-gray-500";
  const vsText = isDark ? "text-gray-500" : "text-gray-400";

  return (
    <div
      className={`w-[110px] flex-shrink-0 rounded-xl border ${border} ${bg} text-center p-2 transition-all duration-300`}
    >
      {/* Round */}
      <p className={`text-[20px] font-bold tracking-wide font-mono mb-1 ${roundText}`}>
        R{round}
      </p>

      {/* Choices */}
      <div className="flex items-center justify-center gap-2 my-1">
        {myIcon ? (
          <img src={myIcon} alt="me" className="w-6 h-6 object-contain" />
        ) : (
          "-"
        )}

        <span className={`text-xs ${vsText}`}>vs</span>

        {oppIcon ? (
          <img src={oppIcon} alt="opp" className="w-6 h-6 object-contain" />
        ) : (
          "-"
        )}
      </div>

      {/* Result */}
      <p
        className="text-[11px] font-bold mt-1"
        style={{ color }}
      >
        {label}
      </p>
    </div>
  );
}