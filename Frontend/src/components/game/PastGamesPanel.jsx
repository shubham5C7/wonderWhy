import React, { useEffect, useState } from "react";
import { FaTrophy, FaSkull, FaHandshake } from "react-icons/fa";

export default function PastGamesPanel({ roomId, myName, isDark, refreshKey }) { 
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardBg    = isDark ? "bg-gray-900"   : "bg-white";
  const cardBorder= isDark ? "border-gray-700" : "border-gray-200";
  const subText   = isDark ? "text-gray-400"  : "text-gray-500";
  const rowBg     = isDark ? "bg-gray-800/60" : "bg-gray-50";
  const rowBorder = isDark ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    fetch(`http://18.60.40.223:8000/api/game?roomId=${roomId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId, refreshKey]); 

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResult = (game) => {
    if (!game.winner || game.winner === "draw")
      return { 
        label: "Draw", 
        color: "#facc15", 
        emoji: <FaHandshake style={{ color: "#facc15" }} size={18} /> 
      };
    if (game.winner === myName)
      return { 
        label: "You Won", 
        color: "#4ade80", 
        emoji: <FaTrophy style={{ color: "#facc15" }} size={18} /> 
      };
    return { 
      label: "You Lost", 
      color: "#f87171", 
      emoji: <FaSkull style={{ color: "#facc15" }} size={18} /> 
    };
  };

  const getScore = (game) => {
    const p1 = game.player1 ?? "";
    const p2 = game.player2 ?? "";
    const scores = game.scores ?? [0, 0];
    const meIdx = [p1, p2].indexOf(myName);
    const myWins  = meIdx >= 0 ? (scores[meIdx] ?? 0) : 0;
    const oppWins = meIdx === 0 ? (scores[1] ?? 0) : (scores[0] ?? 0);
    const oppName = meIdx === 0 ? p2 : p1;
    return { myWins, oppWins, oppName };
  };

  return (
    <div className={`${cardBg} border ${cardBorder} rounded-lg p-4 flex flex-col`}>
      <h3 className={`text-center text-xs ${subText} mb-3 tracking-widest`}>
        PAST GAMES
      </h3>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-xs ${subText} animate-pulse`}>Loading...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className={`text-xs ${subText}`}>No past games in this room</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map((game) => {
            const { label, color, emoji } = getResult(game);
            const { myWins, oppWins, oppName } = getScore(game);

            return (
              <div
                key={game.id}
                className={`rounded-lg border ${rowBorder} ${rowBg} px-3 py-2 flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2 min-w-[80px]">
                  <span className="flex items-center">{emoji}</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {label}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono font-bold">
                  <span style={{ color: "#22d3ee" }}>{myWins}</span>
                  <span className={subText}>–</span>
                  <span style={{ color: "#a855f7" }}>{oppWins}</span>
                </div>

                <div className={`text-xs ${subText} truncate max-w-[80px] text-right`}>
                  vs {oppName ?? "Unknown"}
                </div>

                <div className={`text-[10px] ${subText} whitespace-nowrap`}>
                  {formatDate(game.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}