import { BookOpen, Droplets, Flower2, Sparkles } from "lucide-react";
import type { GameData } from "../game/types";
import { getChapter, localized } from "../game/levels";
import { t } from "../game/i18n";
import { MAX_DEW, regenCountdown } from "../game/engine";
import { useState, useEffect } from "react";

interface TopBarProps {
  game: GameData;
  onJourney: () => void;
}

export default function TopBar({ game, onJourney }: TopBarProps) {
  const { lang } = game.settings;
  const chapter = getChapter(game.levelId);
  const [remaining, setRemaining] = useState(() => regenCountdown(game));

  useEffect(() => {
    const update = () => setRemaining(regenCountdown(game));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [game.dew, game.lastRegen, game.levelId]);

  const dewHint = game.dew >= MAX_DEW ? t(lang, "energy.full") : t(lang, "energy.regen", {
    n: Math.max(1, Math.ceil(remaining / 60000))
  });

  return (
    <header className="topbar">
      <button className="topbar-level" onClick={onJourney}>
        <span className="topbar-seal">{game.levelId}</span>
        <span className="topbar-level-copy">
          <small>{localized(chapter.label, lang)}</small>
          <strong>{t(lang, "top.stage", { n: game.levelId })}</strong>
        </span>
        <span className="topbar-progress-pill">
          <BookOpen size={11}/>
          {game.completed.length}/24
        </span>
      </button>
      <div className="stat-row">
        <div className="stat-chip dew-chip" title={dewHint}>
          <span className="stat-icon"><Droplets size={15}/></span>
          <span>
            <small>{t(lang, "top.dew")}</small>
            <b>{game.dew}<em>/{MAX_DEW}</em></b>
          </span>
        </div>
        <div className="stat-chip">
          <span className="stat-icon coin-icon"><Flower2 size={15}/></span>
          <span>
            <small>{t(lang, "top.coins")}</small>
            <b>{game.coins}</b>
          </span>
        </div>
        <div className="stat-chip dream-chip">
          <span className="stat-icon"><Sparkles size={14}/></span>
          <span>
            <small>{t(lang, "top.dream")}</small>
            <b>{game.dream}</b>
          </span>
        </div>
      </div>
    </header>
  );
}
