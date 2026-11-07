import { useEffect, useRef, useState } from "react";
import { BookOpen, Droplets, Volume2, VolumeX } from "lucide-react";
import type { GameEvent, Kind, Lang, MergeMode, ThemeId } from "./game/types";
import { getChapter, getLevel, itemName, localized } from "./game/levels";
import {
  allDiscovered,
  areAdjacent,
  connectedItemGroup,
  findHint,
  itemKey,
  MAX_DEW,
  mergeGroupForPair
} from "./game/engine";
import { t } from "./game/i18n";
import { useGame } from "./game/useGame";
import { haptic, quietSound } from "./game/audio";
import Scenery from "./components/Scenery";
import Cover from "./components/Cover";
import TopBar from "./components/TopBar";
import GoalCard from "./components/GoalCard";
import GameBoard from "./components/GameBoard";
import BottomNav, { type SheetName } from "./components/BottomNav";
import {
  AlbumSheet,
  CompletionModal,
  JourneySheet,
  SettingsSheet,
  ShopSheet,
  StorySheet,
  TutorialOverlay,
  type SheetId
} from "./components/Sheets";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface ToastData {
  id: number;
  text: string;
  tone: "calm" | "good" | "warn";
}

function eventMessage(event: GameEvent, lang: Lang): { text: string; tone: ToastData["tone"] } | null {
  const item = event.kind && event.level ? itemName(event.kind, event.level, lang) : "";
  switch (event.type) {
    case "spawn":
      return { text: t(lang, "toast.spawn", { item }), tone: "good" };
    case "merge":
      return {
        text: t(lang, event.amount === 2 ? "toast.mergeFive" : "toast.mergeThree", { item }),
        tone: "good"
      };
    case "notEnough":
      return {
        text: event.kind && event.level
          ? `${item} · ${t(lang, "toast.notEnough", { n: event.missing ?? 1 })}`
          : t(lang, "toast.notEnough", { n: event.missing ?? 1 }),
        tone: "warn"
      };
    case "notAdjacent":
      return { text: t(lang, "toast.notAdjacent"), tone: "warn" };
    case "noDew":
      return { text: t(lang, "toast.noDew"), tone: "warn" };
    case "boardFull":
      return { text: t(lang, "toast.boardFull"), tone: "warn" };
    case "fog":
      return { text: t(lang, "toast.fog"), tone: "good" };
    case "undo":
      return { text: t(lang, "toast.undo"), tone: "calm" };
    case "undoEmpty":
      return { text: t(lang, "toast.undoEmpty"), tone: "calm" };
    case "shuffle":
      return { text: t(lang, "toast.shuffle"), tone: "calm" };
    case "buy":
      return { text: t(lang, "toast.buy", { item: "" }).replace(/[：:]\s*$/, ""), tone: "good" };
    case "notEnoughCoins":
      return { text: t(lang, "toast.notEnoughCoins"), tone: "warn" };
    case "daily":
      return { text: t(lang, "toast.daily"), tone: "good" };
    case "locked":
      return { text: t(lang, "toast.locked"), tone: "warn" };
    case "noMerge":
      return { text: t(lang, "toast.noMerge"), tone: "calm" };
    case "maxLevel":
      return { text: lang === "zh" ? "这一阶已经合到顶了。" : "This tier is already complete.", tone: "calm" };
    case "selected":
      return null;
    case "move":
      return null;
    case "deliver":
      return { text: t(lang, "toast.deliver"), tone: "good" };
    default:
      return null;
  }
}

export default function App() {
  const { state, dispatch } = useGame();
  const game = state.game;
  const lang = game.settings.lang;
  const [showCover, setShowCover] = useState(true);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [tutorial, setTutorial] = useState(false);
  const [completion, setCompletion] = useState<number | null>(null);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const lastEventRef = useRef(0);
  const lastLevelRef = useRef(game.levelId);

  const showToast = (text: string, tone: ToastData["tone"] = "calm") => {
    setToast({ id: Date.now(), text, tone });
  };

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = lang === "zh" ? "桂庭拾光" : "Garden of Little Lights";
  }, [lang]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (game.settings.tutorialDone === false) {
        setTutorial(true);
      }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [game.settings.tutorialDone]);

  useEffect(() => {
    const standaloneNow =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setStandalone(standaloneNow);
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setStandalone(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2100);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (lastLevelRef.current !== game.levelId) {
      lastLevelRef.current = game.levelId;
      setSelected(null);
      setHint(null);
    }
  }, [game.levelId]);

  useEffect(() => {
    const current = state.event;
    if (!current || current.id === lastEventRef.current) return;
    lastEventRef.current = current.id;
    quietlyReact(current);
  }, [state.event]);

  const quietlyReact = (event: GameEvent) => {
    quietSound.play(event.type, game.settings.sound);
    if (event.type === "merge" || event.type === "deliver") {
      haptic(game.settings.haptics, true);
    } else if (!["move", "selected"].includes(event.type)) {
      haptic(game.settings.haptics);
    }
    if (event.type === "deliver") {
      setSelected(null);
      setHint(null);
      setCompletion(game.levelId);
      return;
    }
    const message = eventMessage(event, lang);
    if (message) setToast({ id: event.id, ...message });
    if (event.type === "merge") setHint(null);
  };

  const updateSettings = (patch: Partial<typeof game.settings>) => {
    dispatch({ type: "settings", patch });
  };

  const toggleLanguage = (next: Lang) => updateSettings({ lang: next });
  const toggleSound = () => {
    const next = !game.settings.sound;
    updateSettings({ sound: next });
    if (next) quietSound.play("buy", true);
  };

  const enterGame = () => {
    dispatch({ type: "start" });
    setShowCover(false);
    if (!game.settings.tutorialDone) setTutorial(true);
  };

  const selectKind = (kind: Kind) => {
    dispatch({ type: "selectKind", kind });
  };

  const gather = () => {
    dispatch({ type: "spawn", kind: game.selectedKind });
    setHint(null);
  };

  const tapCell = (index: number) => {
    const cell = game.board[index];
    if (!cell) return;
    if (cell.type === "fog") {
      dispatch({ type: "clearFog", index });
      setSelected(null);
      setHint(null);
      return;
    }
    if (selected === null) {
      setSelected(index);
      haptic(game.settings.haptics);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const selectedCell = game.board[selected];
    if (
      selectedCell?.type === "item" &&
      cell.type === "item" &&
      selectedCell.kind === cell.kind &&
      selectedCell.level === cell.level
    ) {
      if (!areAdjacent(selected, index)) {
        showToast(t(lang, "toast.notAdjacent"), "warn");
        return;
      }
      if (!mergeGroupForPair(game.board, selected, index, game.mergeMode)) {
        const groupSize = connectedItemGroup(game.board, index).length;
        showToast(
          t(lang, "toast.notEnough", { n: Math.max(1, game.mergeMode - groupSize) }),
          "warn"
        );
        return;
      }
    }
    dispatch({ type: "move", from: selected, to: index });
    setSelected(null);
    setHint(null);
  };

  const moveCell = (from: number, to: number) => {
    const source = game.board[from];
    const target = game.board[to];
    if (
      source?.type === "item" &&
      target?.type === "item" &&
      source.kind === target.kind &&
      source.level === target.level
    ) {
      if (!areAdjacent(from, to)) {
        showToast(t(lang, "toast.notAdjacent"), "warn");
        return;
      }
      if (!mergeGroupForPair(game.board, from, to, game.mergeMode)) {
        const groupSize = connectedItemGroup(game.board, to).length;
        showToast(
          t(lang, "toast.notEnough", { n: Math.max(1, game.mergeMode - groupSize) }),
          "warn"
        );
        return;
      }
    }
    dispatch({ type: "move", from, to });
    setSelected(null);
    setHint(null);
  };

  const chooseMergeMode = (mode: MergeMode) => {
    dispatch({ type: "mergeMode", mode });
    setHint(null);
    haptic(game.settings.haptics);
  };

  const undo = () => {
    dispatch({ type: "undo" });
    setSelected(null);
    setHint(null);
  };

  const askHint = () => {
    const pair = findHint(game.board, game.mergeMode);
    if (!pair) {
      setHint(null);
      showToast(t(lang, "toast.noMerge"), "calm");
      return;
    }
    setHint(pair);
    showToast(t(lang, "toast.hint"), "calm");
  };

  const nextLevel = () => {
    dispatch({ type: "nextLevel" });
    setCompletion(null);
    setSelected(null);
    setHint(null);
  };

  const finishTutorial = () => {
    updateSettings({ tutorialDone: true });
    setTutorial(false);
  };

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setStandalone(true);
      setInstallPrompt(null);
      return;
    }
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    showToast(
      isIos ? t(lang, "settings.iosInstall") : t(lang, "settings.androidInstall"),
      "calm"
    );
  };

  const navigate = (next: SheetName) => {
    if (next === null) setSheet(null);
    else setSheet(next);
  };

  const buyShopItem = (item: "dew" | "seed" | "rake" | "shuffle") => {
    dispatch({ type: "buy", item });
    setHint(null);
    setSelected(null);
  };

  const chooseTheme = (theme: ThemeId) => {
    dispatch({ type: "buyTheme", theme });
  };

  const currentLevel = getLevel(game.levelId);
  const chapter = getChapter(game.levelId);

  return (
    <div className={`app theme-${game.theme} ${game.settings.motion ? "" : "reduce-motion"} ${showCover ? "cover-active" : ""}`}>
      <Scenery motion={game.settings.motion} lang={lang}/>

      <div className="game-layout">
        <aside className="desktop-aside" aria-hidden="true">
          <div className="aside-index">
            <span>{String(game.levelId).padStart(2, "0")}</span>
            <i/>
            <small>24</small>
          </div>
          <div className="aside-title">
            <span>{lang === "zh" ? "桂庭" : "GARDEN"}</span>
            <span>{lang === "zh" ? "拾光" : "OF LIGHT"}</span>
          </div>
          <div className="aside-quote">
            <p>{localized(chapter.line, lang)}</p>
            <small>{localized(chapter.label, lang)}</small>
          </div>
          <div className="aside-progress">
            <span>{t(lang, "top.progress", { done: game.completed.length })}</span>
            <div><i style={{ width: `${(game.completed.length / 24) * 100}%` }}/></div>
          </div>
        </aside>

        <main className="game-column">
          <TopBar game={game} onJourney={() => setSheet("journey")}/>
          <GoalCard
            game={game}
            board={game.board}
            onDeliver={() => dispatch({ type: "deliver" })}
            onStory={() => setSheet("story")}
            onNext={() => {
              if (game.completed.length >= 24) {
                dispatch({ type: "reset" });
                setSelected(null);
                setHint(null);
              } else {
                dispatch({ type: "nextLevel" });
              }
            }}
          />
          <GameBoard
            game={game}
            selected={selected}
            hint={hint}
            mergeEvent={state.event?.type === "merge" ? state.event : null}
            onTapCell={tapCell}
            onMove={moveCell}
            onSelectKind={selectKind}
            onGather={gather}
            onMergeMode={chooseMergeMode}
            onUndo={undo}
            onAutoMerge={() => dispatch({ type: "autoMerge" })}
            onHint={askHint}
          />
          <BottomNav
            lang={lang}
            active={sheet === "journey" || sheet === "story" || sheet === "howto" ? null : sheet}
            discovered={allDiscovered(game)}
            onNavigate={(next) => {
              setSheet(next);
              setSelected(null);
              setHint(null);
            }}
            onPlay={() => {
              setSheet(null);
              setSelected(null);
              setHint(null);
            }}
          />
        </main>
      </div>

      <div className="quick-sound">
        <button onClick={toggleSound} aria-label={t(lang, "aria.sound")}>
          {game.settings.sound ? <Volume2 size={16}/> : <VolumeX size={16}/>}
        </button>
      </div>

      {showCover && (
        <Cover
          game={game}
          onEnter={enterGame}
          onLanguage={toggleLanguage}
          onSound={toggleSound}
        />
      )}

      {sheet === "album" && <AlbumSheet game={game} onClose={() => setSheet(null)}/>}
      {sheet === "shop" && (
        <ShopSheet
          game={game}
          onClose={() => setSheet(null)}
          onBuy={buyShopItem}
          onDaily={() => dispatch({ type: "daily" })}
        />
      )}
      {sheet === "settings" && (
        <SettingsSheet
          game={game}
          onClose={() => setSheet(null)}
          onSettings={updateSettings}
          onTheme={chooseTheme}
          onReset={() => {
            dispatch({ type: "reset" });
            setSheet(null);
            setCompletion(null);
            setSelected(null);
            setHint(null);
          }}
          onHowTo={() => setSheet("howto")}
          onInstall={handleInstall}
          standalone={standalone}
        />
      )}
      {sheet === "journey" && <JourneySheet game={game} onClose={() => setSheet(null)}/>}
      {sheet === "story" && <StorySheet game={game} onClose={() => setSheet(null)}/>}
      {sheet === "howto" && (
        <TutorialOverlay
          lang={lang}
          fromSettings
          onClose={() => setSheet("settings")}
        />
      )}
      {tutorial && !showCover && <TutorialOverlay lang={lang} onClose={finishTutorial}/>}
      {completion !== null && (
        <CompletionModal
          game={game}
          onNext={nextLevel}
          onStay={() => setCompletion(null)}
          onReplay={() => {
            dispatch({ type: "reset" });
            setCompletion(null);
            setSelected(null);
            setHint(null);
          }}
        />
      )}

      {toast && (
        <div className={`toast toast-${toast.tone}`} role="status" key={toast.id}>
          {toast.tone === "good" ? <SparkleMark/> : toast.tone === "warn" ? <Droplets size={14}/> : <BookOpen size={14}/>}
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}

function SparkleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 0l1.5 5.5L14 7 8.5 8.5 7 14 5.5 8.5 0 7l5.5-1.5z" fill="currentColor"/>
    </svg>
  );
}
