import React, { useReducer, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import { CHOICES, TOTAL_ROUNDS } from "./game/constants";
import PlayerCard from "./game/PlayerCard";
import ChoiceDisplay from "./game/ChoiceDisplay";
import HistoryCard from "./game/HistoryCard";
import GameOverOverlay from "./game/GameOverOverlay";
import PastGamesPanel from "./game/PastGamesPanel";
import { FaTrophy, FaHandshake, FaHourglassHalf } from "react-icons/fa";
import { MdSentimentDissatisfied } from "react-icons/md";


// ACTION TYPES

const ACTIONS = {
  SET_OPP_NAME:     "SET_OPP_NAME",     // Update opponent's display name
  SET_MY_CHOICE:    "SET_MY_CHOICE",    // Player picks rock / paper / scissors
  SET_OPP_CHOSE:    "SET_OPP_CHOSE",    // Opponent has locked in a choice (blind)
  SET_ROUND_RESULT: "SET_ROUND_RESULT", // Server returned result for the round
  SET_ERROR:        "SET_ERROR",        // Socket callback reported an error
  CLEAR_ROUND:      "CLEAR_ROUND",      // Reset per-round state after reveal delay
  GAME_OVER:        "GAME_OVER",        // All rounds finished; store final winner
  SHOW_OVERLAY:     "SHOW_OVERLAY",     // Show the game-over modal (after delay)
  REFRESH_HISTORY:  "REFRESH_HISTORY",  // Nudge PastGamesPanel to re-fetch
  RESET:            "RESET",            // Full reset for rematch
};


// INITIAL STATE

const initialState = {
  oppName:        "Opponent", // Opponent display name (hydrated from localStorage)
  round:          1,          // Current round number (1-based)
  scores:         [0, 0],     // [myScore, oppScore]
  history:        [],         // Array of { p1Choice, p2Choice, result } per round
  myChoice:       null,       // Key of the choice this player picked this round
  opponentChose:  false,      // True once server emits game:opponent-chose
  roundResult:    null,       // { myChoice, oppChoice, result } after reveal
  showOverlay:    false,      // Whether the GameOverOverlay is visible
  overallWinner:  null,       // Name of the overall game winner (or null for tie)
  locked:         false,      // Prevents double-submission while socket acks
  error:          "",         // Error message shown in the toast
  refreshHistory: 0,          // Incremented to trigger PastGamesPanel re-fetch
};


// REDUCER

function gameReducer(state, action) {
  switch (action.type) {

    // Opponent's name arrived (from room:ready or game:result events)
    case ACTIONS.SET_OPP_NAME:
      return { ...state, oppName: action.payload };

    // Player clicked a choice button — lock immediately to prevent re-click
    case ACTIONS.SET_MY_CHOICE:
      return { ...state, myChoice: action.payload, locked: true };

    // Blind notification that opponent has submitted (don't reveal what yet)
    case ACTIONS.SET_OPP_CHOSE:
      return { ...state, opponentChose: true };

    // Server sent the round result — update scores, history, and round counter
    // in one atomic update so no render sees partial/inconsistent state.
    case ACTIONS.SET_ROUND_RESULT: {
      const { me, opp, winner, myName } = action.payload;

      // Derive win / lose / tie from the server's winner field
      const result =
        winner === null     ? "tie"
        : winner === myName ? "win"
        : "lose";

      // Immutably update the score array
      const nextScores = [...state.scores];
      if (result === "win")  nextScores[0]++;
      if (result === "lose") nextScores[1]++;

      return {
        ...state,
        // Keep oppName fresh; ignore the "Opponent" placeholder
        oppName:     opp?.name && opp.name !== "Opponent" ? opp.name : state.oppName,
        roundResult: { myChoice: me?.choice, oppChoice: opp?.choice, result },
        scores:      nextScores,
        history:     [
          ...state.history,
          { p1Choice: me?.choice, p2Choice: opp?.choice, result },
        ],
        round: state.round + 1,
      };
    }

    // Socket callback returned an error — surface the message and unlock
    // so the player can try again. Empty payload just clears the toast.
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error:    action.payload,
        myChoice: action.payload ? null  : state.myChoice,
        locked:   action.payload ? false : state.locked,
      };

    // Called after the 2-second reveal delay to reset per-round UI state
    case ACTIONS.CLEAR_ROUND:
      return {
        ...state,
        myChoice:      null,
        opponentChose: false,
        roundResult:   null,
        locked:        false,
      };

    // Game finished  (store the winner and bump refreshHistory so PastGamesPanel)
    // fetches the newly saved game record from the server
    case ACTIONS.GAME_OVER:
      return {
        ...state,
        overallWinner:  action.payload,
        refreshHistory: state.refreshHistory + 1,
      };

    // Show the game-over overlay (fired 200ms after GAME_OVER so the last
    // round result animation has time to finish first)
    case ACTIONS.SHOW_OVERLAY:
      return { ...state, showOverlay: true };

    // Manual increment if something else needs to trigger a history re-fetch
    case ACTIONS.REFRESH_HISTORY:
      return { ...state, refreshHistory: state.refreshHistory + 1 };

    // Full reset for rematch — spread initialState for a clean slate, then
    // optionally override oppName so the UI doesn't flash back to "Opponent"
    case ACTIONS.RESET:
      return {
        ...initialState,
        oppName: action.payload?.oppName ?? initialState.oppName,
      };

    // Unknown action — return state unchanged (keeps reducer pure & safe)
    default:
      return state;
  }
}


export default function GameRoom() {
  const navigate            = useNavigate();
  const { id: paramRoomId } = useParams();
  const vantaRef = useRef(null);

  // Pull identity and theme from Redux; fall back gracefully if fields missing
  const myName = useSelector(
    (s) =>
      s.user.user?.name     ??
      s.user.user?.username ??
      s.user.user?.email    ??
      "You"
  );
  const roomId = useSelector((s) => s.room?.roomId) || paramRoomId;
  const isDark = useSelector((state) => state.theme.isDark);

  // Single dispatch function replaces all the individual useState setters
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Destructure for convenient use in JSX
  const {
    oppName, round, scores, history,
    myChoice, opponentChose, roundResult,
    showOverlay, overallWinner, locked,
    error, refreshHistory,
  } = state;

  // Per-user key: prevents two players on the same browser/origin from
  // reading each other's saved opponent name out of localStorage
  const oppStorageKey = `opp_${roomId}_${myName}`;

  // Restore persisted opponent name on mount
  useEffect(() => {
    const saved = localStorage.getItem(oppStorageKey);
    if (saved) dispatch({ type: ACTIONS.SET_OPP_NAME, payload: saved });
  }, [oppStorageKey]);

  // Reset helper (used by rematch)
  // Wrapped in useCallback so it's stable across renders and safe in the
  // socket useEffect's dependency array without triggering re-registration
  const resetGame = useCallback((newOppName) => {
    dispatch({ type: ACTIONS.RESET, payload: { oppName: newOppName } });
  }, []);

  // Socket event listeners
  // All listeners are registered once (deps: myName, oppStorageKey, resetGame)
  // and cleaned up on unmount to prevent memory leaks or duplicate handlers.
  useEffect(() => {

    // Both players joined (identify the opponent)
    const onRoomReady = ({ players }) => {
      const opp = players?.find((p) => p.name !== myName);
      if (opp?.name) {
        dispatch({ type: ACTIONS.SET_OPP_NAME, payload: opp.name });
        localStorage.setItem(oppStorageKey, opp.name);
      }
    };

    // Opponent locked in their choice show the "waiting on you" hint
    const onOpponentChose = () =>
      dispatch({ type: ACTIONS.SET_OPP_CHOSE });

    // Round resolved(update state then schedule the reveal clear)
    const onResult = ({ players: ps, winner }) => {
      const me  = ps?.find((p) => p.name === myName);
      const opp = ps?.find((p) => p.name !== myName);

      // Keep localStorage fresh with the latest confirmed opponent name
      if (opp?.name && opp.name !== "Opponent") {
        localStorage.setItem(oppStorageKey, opp.name);
      }

      dispatch({ type: ACTIONS.SET_ROUND_RESULT, payload: { me, opp, winner, myName } });

      // After 2 s the reveal animation is done clear per-round UI state
      setTimeout(() => dispatch({ type: ACTIONS.CLEAR_ROUND }), 2000);
    };

    // All rounds done (store winner, then show overlay after a short delay)
    const onGameOver = ({ winner }) => {
      dispatch({ type: ACTIONS.GAME_OVER, payload: winner ?? null });
      // 2.2 s gives the last round result time to animate before the overlay appears
      setTimeout(() => dispatch({ type: ACTIONS.SHOW_OVERLAY }), 2200);
    };

    // Opponent accepted rematch  (full reset, preserve new opponent name)
    const onRematchStart = ({ players }) => {
      const opp = players?.find((p) => p.name !== myName);
      if (opp?.name) localStorage.setItem(oppStorageKey, opp.name);
      resetGame(opp?.name);
    };

    // Register all listeners
    socket.on("room:ready",          onRoomReady);
    socket.on("game:opponent-chose", onOpponentChose);
    socket.on("game:result",         onResult);
    socket.on("game:over",           onGameOver);
    socket.on("game:rematch-start",  onRematchStart);

    // Cleanup: remove every listener on unmount or when deps change
    return () => {
      socket.off("room:ready",          onRoomReady);
      socket.off("game:opponent-chose", onOpponentChose);
      socket.off("game:result",         onResult);
      socket.off("game:over",           onGameOver);
      socket.off("game:rematch-start",  onRematchStart);
    };
  }, [myName, oppStorageKey, resetGame]);

// Replace your Vanta useEffect with this:
useEffect(() => {
  if (!window.VANTA || !vantaRef.current) return; // ← add !vantaRef.current check

  const effect = window.VANTA.GLOBE({
    el: vantaRef.current,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    color: 0x595191,
    color2: 0xffffff,
    size: 1,
    backgroundColor: isDark ? 0x0f172a : 0xf3f4f6
  });

  return () => {
    if (effect) effect.destroy();
  };
}, [isDark]);

  // Choice handler
  // Guards against double-clicks (locked) or re-picking after already chose
  const handleChoice = useCallback(
    (choice) => {
      if (locked || myChoice) return;

      // Optimistically update UI before server acks
      dispatch({ type: ACTIONS.SET_MY_CHOICE, payload: choice });

      socket.emit("game:choice", choice, (res) => {
        if (!res?.ok) {
          // Server rejected — roll back choice and surface the error toast
          dispatch({
            type:    ACTIONS.SET_ERROR,
            payload: res?.message || "Error sending choice",
          });
        }
      });
    },
    [locked, myChoice]
  );

  // Leave & rematch 
  const handleLeave = () => {
    localStorage.removeItem(oppStorageKey); // Clean up persisted opponent name
    socket.emit("room:leave");
    navigate("/");
  };

  const handleRematch = () => socket.emit("game:rematch");

  //  Derived UI values 
  const isWinning = scores[0] > scores[1];
  const isLosing  = scores[1] > scores[0];

  // Status banner shown above the choice buttons
  const statusText =
    roundResult?.result === "win"  ? (
       <span className="flex items-center gap-2 text-yellow-400">
      <FaTrophy /> You Won This Round!
    </span>
    ):roundResult?.result === "lose" ? (
      <span className="flex items-center gap-2 text-yellow-400">
      <MdSentimentDissatisfied /> You Lost This Round!
    </span>
    ): roundResult?.result === "tie"  ?(
      <span className="flex items-center gap-2 text-yellow-400">
      <FaHandshake /> It's a Tie!
    </span>
    ): opponentChose ?(
       <span className="flex items-center gap-2 text-yellow-400">
      <FaHourglassHalf /> Opponent chose — your turn!
    </span>
    ) :(
       <span className="text-yellow-400">Make your move</span>
    )
    
  // Theme-aware Tailwind classes
  const bg         = isDark ? "bg-gray-950"                  : "bg-gray-100";
  const text       = isDark ? "text-white"                    : "text-gray-900";
  const cardBg     = isDark ? "bg-gray-900"                   : "bg-white";
  const cardBorder = isDark ? "border-gray-700"               : "border-gray-200";
  const subText    = isDark ? "text-gray-400"                 : "text-gray-900";
  const btnBg      = isDark ? "bg-gray-900 hover:bg-gray-800" : "bg-white hover:bg-gray-50";
  const btnBorder  = isDark ? "border-gray-700"               : "border-gray-300";

  //Render 
  return (
    <div ref={vantaRef} className={`min-h-screen ${bg} ${text} px-4 py-4 transition-colors duration-300`}>

      {/* Error toast ( fixed at top-centre, disappears when error clears) */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm z-50">
          {error}
        </div>
      )}

      {/* Room ID pill */}
      <div className="flex justify-center mb-4">
        <div className={`inline-flex items-center ${cardBg} border ${cardBorder} rounded-md px-3 py-1.5`}>
          <span className={`text-[10px] ${subText} mr-2`}>ROOM</span>
          <span className="text-sm tracking-widest font-semibold">{roomId}</span>
        </div>
      </div>

      {/* SCOREBOARD */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <PlayerCard name={myName} score={scores[0]} isMe isDark={isDark} />

        <div className="text-center">
          <div className="text-2xl font-bold">
            {scores[0]}
            <span className={`${subText} mx-1`}>vs</span>
            {scores[1]}
          </div>
          <p className={`text-xs ${subText} mt-1`}>
            {isWinning ? "You lead" : isLosing ? "Opponent leads" : "Even"}
          </p>
        </div>

        <PlayerCard name={oppName} score={scores[1]} isDark={isDark} />
      </div>

      {/*  ROUND INDICATOR */}
      <div className="flex justify-center mb-6">
        <div className={`px-5 py-1 rounded-full ${cardBg} border ${cardBorder} text-xs tracking-wide`}>
          ROUND {Math.min(round, TOTAL_ROUNDS)} / {TOTAL_ROUNDS}
        </div>
      </div>

      {/* GAME AREA( Choice displays && buttons)  */}
      <div className="flex flex-col items-center gap-5">
        <p className={`text-xs ${subText}`}>{statusText}</p>

        <div className="flex items-center justify-center gap-12">

          {/* Left panel ( shows what this player chose) */}
          <ChoiceDisplay
            label="YOU"
            choiceKey={roundResult?.myChoice || myChoice}
            isRevealed={!!(roundResult?.myChoice || myChoice)}
            color="#22d3ee"
            isDark={isDark}
          />

          {/* Centre (clickable choice buttons) */}
          <div className="flex gap-10">
            {CHOICES.map((c) => {
              // Cyan highlight if my pick, purple if opponent's pick after reveal
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

          {/* Right panel opponent's choice */}
          <ChoiceDisplay
            label={oppName}
            choiceKey={roundResult?.oppChoice}
            isRevealed={!!roundResult?.oppChoice}
            color="#a855f7"
            isDark={isDark}
          />
        </div>
      </div>

      {/* HISTORY && PAST GAMES (side-by-side)*/}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-14 max-w-6xl mx-auto">

        {/* Current game: round-by-round history cards */}
        <div className={`${cardBg} border ${cardBorder} rounded-lg p-4`}>
          <h3 className={`text-center text-xs ${subText} mb-3`}>HISTORY</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <HistoryCard key={i} round={i + 1} data={history[i]} isDark={isDark} />
            ))}
          </div>
        </div>

        {/* Previously played games (refreshKey increments on GAME_OVER) */}
        <PastGamesPanel
          roomId={roomId}
          myName={myName}
          isDark={isDark}
          refreshKey={refreshHistory}
        />
      </div>

      {/*  FOOTER: Leave / Rematch*/}
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

      {/*GAME OVER OVERLAY (sits on top of everything)*/}
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