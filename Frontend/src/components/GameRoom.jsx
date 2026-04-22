import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import { CHOICES, TOTAL_ROUNDS } from "./game/constants";
import PlayerCard from "./game/PlayerCard";
import ChoiceDisplay from "./game/ChoiceDisplay";
import HistoryCard from "./game/HistoryCard";
import GameOverOverlay from "./game/GameOverOverlay";
import PastGamesPanel from "./game/PastGamesPanel";

export default function GameRoom() {
  const navigate    = useNavigate();
  const { id: paramRoomId } = useParams();

  // ── FIX 1: Same name resolution as Home and WaitingRoom.
  //           name → username → email so email-login users see their name.
  const myName = useSelector(
    (s) =>
      s.user.user?.name ??
      s.user.user?.username ??
      s.user.user?.email ??
      "You"
  );
  const roomId  = useSelector((s) => s.room?.roomId) || paramRoomId;
  const isDark  = useSelector((state) => state.theme.isDark);

  const [oppName, setOppName]           = useState("Opponent");
  const [round, setRound]               = useState(1);
  const [scores, setScores]             = useState([0, 0]);
  const [history, setHistory]           = useState([]);
  const [myChoice, setMyChoice]         = useState(null);
  const [opponentChose, setOpponentChose] = useState(false);
  const [roundResult, setRoundResult]   = useState(null);
  const [showOverlay, setShowOverlay]   = useState(false);
  const [overallWinner, setOverallWinner] = useState(null);
  const [locked, setLocked]             = useState(false);
  const [error, setError]               = useState("");
  const [refreshHistory, setRefreshHistory] = useState(0);

  // ── BUG 1 FIX: Use `opp_${roomId}_${myName}` so each user (on the same
  //              browser/origin) has an isolated localStorage entry and never
  //              reads the other player's saved opponent name.
  const oppStorageKey = `opp_${roomId}_${myName}`;

  useEffect(() => {
    const saved = localStorage.getItem(oppStorageKey);
    if (saved) setOppName(saved);
  }, [oppStorageKey]);

  const resetGame = useCallback(() => {
    setRound(1);
    setScores([0, 0]);
    setHistory([]);
    setMyChoice(null);
    setOpponentChose(false);
    setRoundResult(null);
    setShowOverlay(false);
    setOverallWinner(null);
    setLocked(false);
    setError("");
  }, []);

  useEffect(() => {
    const onRoomReady = ({ players }) => {
      const opp = players?.find((p) => p.name !== myName);
      if (opp?.name) {
        setOppName(opp.name);
        localStorage.setItem(oppStorageKey, opp.name); // BUG 1 FIX: use per-user key
      }
    };

    const onOpponentChose = () => setOpponentChose(true);

    const onResult = ({ players: ps, winner }) => {
      const me  = ps?.find((p) => p.name === myName);
      const opp = ps?.find((p) => p.name !== myName);

      if (opp?.name && opp.name !== "Opponent") {
        setOppName(opp.name);
        localStorage.setItem(oppStorageKey, opp.name); // BUG 1 FIX: use per-user key
      }

      const result =
        winner === null ? "tie" : winner === myName ? "win" : "lose";

      setRoundResult({
        myChoice: me?.choice,
        oppChoice: opp?.choice,
        result,
      });

      setScores((prev) => {
        const next = [...prev];
        if (result === "win")  next[0]++;
        if (result === "lose") next[1]++;
        return next;
      });

      setHistory((prev) => [
        ...prev,
        { p1Choice: me?.choice, p2Choice: opp?.choice, result },
      ]);

      setRound((r) => r + 1);

      setTimeout(() => {
        setMyChoice(null);
        setOpponentChose(false);
        setRoundResult(null);
        setLocked(false);
      }, 2000);
    };

    const onGameOver = ({ winner }) => {
      setOverallWinner(winner ?? null);
      setRefreshHistory((n) => n + 1);
      setTimeout(() => setShowOverlay(true), 2200);
    };

    const onRematchStart = ({ players }) => {
      resetGame();
      const opp = players?.find((p) => p.name !== myName);
      if (opp?.name) {
        setOppName(opp.name);
        localStorage.setItem(oppStorageKey, opp.name); // BUG 1 FIX: use per-user key
      }
    };

    socket.on("room:ready",            onRoomReady);
    socket.on("game:opponent-chose",   onOpponentChose);
    socket.on("game:result",           onResult);
    socket.on("game:over",             onGameOver);
    socket.on("game:rematch-start",    onRematchStart);

    return () => {
      socket.off("room:ready",           onRoomReady);
      socket.off("game:opponent-chose",  onOpponentChose);
      socket.off("game:result",          onResult);
      socket.off("game:over",            onGameOver);
      socket.off("game:rematch-start",   onRematchStart);
    };
  }, [myName, roomId, oppStorageKey, resetGame]);

  const handleChoice = useCallback(
    (choice) => {
      if (locked || myChoice) return;
      setMyChoice(choice);
      setLocked(true);

      socket.emit("game:choice", choice, (res) => {
        if (!res?.ok) {
          setError(res?.message || "Error sending choice");
          setMyChoice(null);
          setLocked(false);
        }
      });
    },
    [locked, myChoice]
  );

  const handleLeave = () => {
    localStorage.removeItem(oppStorageKey); // BUG 1 FIX: use per-user key
    socket.emit("room:leave");
    navigate("/");
  };

  const handleRematch = () => {
    socket.emit("game:rematch");
  };

  const isWinning = scores[0] > scores[1];
  const isLosing  = scores[1] > scores[0];

  const statusText =
    roundResult?.result === "win"
      ? "🎉 You Won This Round!"
      : roundResult?.result === "lose"
      ? "😤 You Lost This Round!"
      : roundResult?.result === "tie"
      ? "🤝 It's a Tie!"
      : opponentChose
      ? "⏳ Opponent chose — your turn!"
      : "Make your move";

  const bg         = isDark ? "bg-gray-950"             : "bg-gray-100";
  const text       = isDark ? "text-white"               : "text-gray-900";
  const cardBg     = isDark ? "bg-gray-900"              : "bg-white";
  const cardBorder = isDark ? "border-gray-700"          : "border-gray-200";
  const subText    = isDark ? "text-gray-400"            : "text-gray-900";
  const btnBg      = isDark ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50";
  const btnBorder  = isDark ? "border-gray-700"          : "border-gray-300";

  return (
    <div className={`min-h-screen ${bg} ${text} px-4 py-4 transition-colors duration-300`}>

      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm z-50">
          {error}
        </div>
      )}

      {/* TOP BAR */}
      <div className="flex justify-center mb-4">
        <div className={`inline-flex items-center ${cardBg} border ${cardBorder} rounded-md px-3 py-1.5`}>
          <span className={`text-[10px] ${subText} mr-2`}>ROOM</span>
          <span className="text-sm tracking-widest font-semibold">{roomId}</span>
        </div>
      </div>

      {/* SCORE */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <PlayerCard name={myName} score={scores[0]} isMe isDark={isDark} />
        <div className="text-center">
          <div className="text-2xl font-bold">
            {scores[0]}{" "}
            <span className={`${subText} mx-1`}>vs</span>{" "}
            {scores[1]}
          </div>
          <p className={`text-xs ${subText} mt-1`}>
            {isWinning ? "You lead" : isLosing ? "Opponent leads" : "Even"}
          </p>
        </div>
        <PlayerCard name={oppName} score={scores[1]} isDark={isDark} />
      </div>

      {/* ROUND */}
      <div className="flex justify-center mb-6">
        <div className={`px-5 py-1 rounded-full ${cardBg} border ${cardBorder} text-xs tracking-wide`}>
          ROUND {Math.min(round, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
        </div>
      </div>

      {/* GAME AREA */}
      <div className="flex flex-col items-center gap-5">
        <p className={`text-xs ${subText}`}>{statusText}</p>

        <div className="flex items-center justify-center gap-12">
          <ChoiceDisplay
            label="YOU"
            choiceKey={roundResult?.myChoice || myChoice}
            isRevealed={!!(roundResult?.myChoice || myChoice)}
            color="#22d3ee"
            isDark={isDark}
          />

          <div className="flex gap-10">
            {CHOICES.map((c) => {
              const isMyPick  = (roundResult?.myChoice || myChoice) === c.key;
              const isOppPick = roundResult?.oppChoice === c.key;

              return (
                <button
                  key={c.key}
                  onClick={() => handleChoice(c.key)}
                  disabled={locked || !!myChoice || showOverlay}
                  title={c.label}
                  className={`w-32 h-44 rounded-2xl border flex flex-col items-center justify-center gap-3
                    transition-all duration-300 ease-out
                    ${
                      isMyPick
                        ? "border-cyan-400 bg-cyan-500/20 scale-110 shadow-[0_0_25px_#22d3ee88]"
                        : isOppPick
                        ? "border-purple-400 bg-purple-500/20 scale-110 shadow-[0_0_25px_#a855f788]"
                        : `${btnBorder} ${btnBg} hover:scale-105 hover:shadow-lg`
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <img src={c.icon} alt={c.label} className="w-26 h-26 object-contain drop-shadow-md" />
                  <span className={`text-xs font-semibold tracking-wide ${subText}`}>{c.label}</span>
                </button>
              );
            })}
          </div>

          <ChoiceDisplay
            label={oppName}
            choiceKey={roundResult?.oppChoice}
            isRevealed={!!roundResult?.oppChoice}
            color="#a855f7"
            isDark={isDark}
          />
        </div>
      </div>

      {/* HISTORY + PAST GAMES */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-14 max-w-6xl mx-auto">

        {/* CURRENT GAME HISTORY */}
        <div className={`${cardBg} border ${cardBorder} rounded-lg p-4`}>
          <h3 className={`text-center text-xs ${subText} mb-3`}>HISTORY</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <HistoryCard key={i} round={i + 1} data={history[i]} isDark={isDark} />
            ))}
          </div>
        </div>

        <PastGamesPanel
          roomId={roomId}
          myName={myName}
          isDark={isDark}
          refreshKey={refreshHistory}
        />

      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-8 max-w-4xl mx-auto">
        <button
          onClick={handleLeave}
          className="px-4 py-2 rounded-md border border-red-500/40 text-red-400 text-sm hover:bg-red-500/10 transition"
        >
          Leave
        </button>
        <button
          onClick={handleRematch}
          className="px-5 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm transition"
        >
          Rematch
        </button>
      </div>

      {showOverlay && (
        <GameOverOverlay
          winner={overallWinner}
          myName={myName}
          isDark={isDark}
          onLeave={handleLeave}
          onRematch={handleRematch}
        />
      )}
    </div>
  );
}