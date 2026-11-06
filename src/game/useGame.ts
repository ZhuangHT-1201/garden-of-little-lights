import { useEffect, useReducer } from "react";
import { createAppState, gameReducer, loadGame, saveGame } from "./engine";

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createAppState(loadGame()));

  useEffect(() => {
    saveGame(state.game);
  }, [state.game]);

  useEffect(() => {
    const timer = window.setInterval(() => dispatch({ type: "tick" }), 5000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") dispatch({ type: "tick" });
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { state, dispatch };
}
