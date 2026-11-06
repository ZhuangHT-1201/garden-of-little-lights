import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Brush,
  Check,
  ChevronRight,
  Download,
  Droplets,
  Flower2,
  Info,
  Languages,
  MoonStar,
  RotateCcw,
  Sparkles,
  Wind,
  X
} from "lucide-react";
import type { GameData, Item, Kind, Lang, ThemeId } from "../game/types";
import { CHAPTERS, getChapter, getLevel, ITEMS, KIND_ORDER, LEVELS, localized } from "../game/levels";
import { allDiscovered, localDateKey } from "../game/engine";
import { t } from "../game/i18n";
import ItemArt from "./ItemArt";

export type SheetId = "album" | "shop" | "settings" | "journey" | "story" | "howto";

interface SheetBaseProps {
  game: GameData;
  onClose: () => void;
}

function SheetFrame({
  lang,
  kicker,
  title,
  onClose,
  children,
  wide = false,
  className = ""
}: {
  lang: Lang;
  kicker: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className={`bottom-sheet ${wide ? "wide" : ""} ${className}`} role="dialog" aria-modal="true">
        <div className="sheet-grip"/>
        <header className="sheet-header">
          <div>
            <span className="sheet-kicker">{kicker}</span>
            <h2>{title}</h2>
          </div>
          <button className="round-close" onClick={onClose} aria-label={t(lang, "aria.close")}>
            <X size={18}/>
          </button>
        </header>
        <div className="sheet-body">{children}</div>
        <div className="sheet-paper-edge"/>
      </section>
    </div>
  );
}

export function AlbumSheet({ game, onClose }: SheetBaseProps) {
  const { lang } = game.settings;
  const discovered = allDiscovered(game);
  const first = useMemo(() => {
    for (const kind of KIND_ORDER) {
      for (let level = 1; level <= 6; level += 1) {
        if (game.discovered.includes(`${kind}-${level}`)) return { kind, level };
      }
    }
    return { kind: "wood" as Kind, level: 3 };
  }, [game.discovered]);
  const [picked, setPicked] = useState(first);
  const known = game.discovered.includes(`${picked.kind}-${picked.level}`);

  return (
    <SheetFrame
      lang={lang}
      kicker={t(lang, "album.kicker")}
      title={t(lang, "album.title")}
      onClose={onClose}
      wide
      className="album-sheet"
    >
      <div className="album-intro">
        <p>{t(lang, "album.copy")}</p>
        <span>{t(lang, "album.progress", { seen: discovered, total: 24 })}</span>
      </div>

      <div className="album-feature">
        <div className={`album-feature-art ${known ? "" : "is-unknown"}`}>
          {known ? <ItemArt kind={picked.kind} level={picked.level}/> : <span>?</span>}
          <i/>
        </div>
        <div className="album-feature-copy">
          <small>{localized(ITEMS[picked.kind].label, lang)} · {t(lang, "album.stage", { n: picked.level })}</small>
          <h3>{known ? localized(ITEMS[picked.kind].levels[picked.level - 1], lang) : t(lang, "album.unknown")}</h3>
          <p>{known ? localized(ITEMS[picked.kind].lore[picked.level - 1], lang) : t(lang, "album.unknownLore")}</p>
          <span className="feature-index">0{picked.level}</span>
        </div>
      </div>

      <div className="album-chains">
        {KIND_ORDER.map((kind) => {
          const knownCount = ITEMS[kind].levels.filter((_, index) => game.discovered.includes(`${kind}-${index + 1}`)).length;
          return (
            <div className="album-chain" key={kind}>
              <div className="chain-title">
                <span className="chain-gem" style={{ background: ITEMS[kind].color }}/>
                <b>{localized(ITEMS[kind].label, lang)}</b>
                <small>{knownCount}/6</small>
              </div>
              <div className="chain-items">
                {ITEMS[kind].levels.map((_, index) => {
                  const level = index + 1;
                  const key = `${kind}-${level}`;
                  const isKnown = game.discovered.includes(key);
                  return (
                    <button
                      key={key}
                      className={picked.kind === kind && picked.level === level ? "active" : ""}
                      onClick={() => setPicked({ kind, level })}
                      aria-label={isKnown ? localized(ITEMS[kind].levels[index], lang) : t(lang, "album.unknown")}
                    >
                      <span className={`chain-art ${isKnown ? "" : "silhouette"}`}>
                        {isKnown ? <ItemArt kind={kind} level={level}/> : <b>?</b>}
                      </span>
                      <small>{level}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </SheetFrame>
  );
}

const shopItems = [
  { id: "dew" as const, icon: Droplets, price: 26, title: "shop.dew", desc: "shop.dewDesc" },
  { id: "seed" as const, icon: Sparkles, price: 16, title: "shop.seed", desc: "shop.seedDesc" },
  { id: "rake" as const, icon: Brush, price: 10, title: "shop.rake", desc: "shop.rakeDesc" },
  { id: "shuffle" as const, icon: Wind, price: 8, title: "shop.shuffle", desc: "shop.shuffleDesc" }
];

export function ShopSheet({
  game,
  onClose,
  onBuy,
  onDaily
}: SheetBaseProps & {
  onBuy: (item: "dew" | "seed" | "rake" | "shuffle") => void;
  onDaily: () => void;
}) {
  const { lang } = game.settings;
  const today = localDateKey();
  const claimed = game.dailyClaimed === today;

  return (
    <SheetFrame
      lang={lang}
      kicker={t(lang, "shop.kicker")}
      title={t(lang, "shop.title")}
      onClose={onClose}
      className="shop-sheet"
    >
      <div className="shop-ledger">
        <p>{t(lang, "shop.copy")}</p>
        <div className="wallet-chip"><Flower2 size={14}/>{game.coins}</div>
      </div>

      <button className="daily-gift" onClick={onDaily} disabled={claimed}>
        <span className="daily-gift-art">
          <MoonStar size={25}/>
          <i>+</i>
        </span>
        <span>
          <small>{t(lang, "shop.daily")}</small>
          <b>{claimed ? t(lang, "shop.claimed") : lang === "zh" ? "花笺 +20 · 露水 +10" : "Notes +20 · Dew +10"}</b>
        </span>
        <ChevronRight size={17}/>
      </button>

      <div className="shop-grid">
        {shopItems.map(({ id, icon: Icon, price, title, desc }) => (
          <article className="shop-card" key={id}>
            <div className="shop-card-art"><Icon size={23}/><i/></div>
            <div>
              <h3>{t(lang, title)}</h3>
              <p>{t(lang, desc)}</p>
            </div>
            <button onClick={() => onBuy(id)} disabled={game.coins < price}>
              <span>{price}</span>
              <Flower2 size={11}/>
            </button>
          </article>
        ))}
      </div>
      <p className="shop-whisper">{t(lang, "shop.story")}</p>
    </SheetFrame>
  );
}

function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span/>
    </button>
  );
}

const themeOptions: Array<{ id: ThemeId; key: string; unlock: number; price: number }> = [
  { id: "dusk", key: "theme.dusk", unlock: 1, price: 0 },
  { id: "mist", key: "theme.mist", unlock: 8, price: 55 },
  { id: "lantern", key: "theme.lantern", unlock: 16, price: 85 }
];

export function SettingsSheet({
  game,
  onClose,
  onSettings,
  onTheme,
  onReset,
  onHowTo,
  onInstall,
  standalone
}: SheetBaseProps & {
  onSettings: (patch: Partial<GameData["settings"]>) => void;
  onTheme: (theme: ThemeId) => void;
  onReset: () => void;
  onHowTo: () => void;
  onInstall: () => void;
  standalone: boolean;
}) {
  const { lang } = game.settings;
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <SheetFrame
      lang={lang}
      kicker={t(lang, "settings.kicker")}
      title={t(lang, "settings.title")}
      onClose={onClose}
      className="settings-sheet"
    >
      <section className="setting-block language-block">
        <div className="setting-copy">
          <span className="setting-icon"><Languages size={17}/></span>
          <div>
            <h3>{t(lang, "settings.language")}</h3>
            <p>{t(lang, "settings.languageNote")}</p>
          </div>
        </div>
        <div className="large-language-switch">
          <button
            className={lang === "zh" ? "active" : ""}
            onClick={() => onSettings({ lang: "zh" })}
          >
            中文
          </button>
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => onSettings({ lang: "en" })}
          >
            English
          </button>
        </div>
      </section>

      <section className="setting-list">
        {[
          { key: "sound" as const, title: "settings.sound", desc: "settings.soundNote" },
          { key: "haptics" as const, title: "settings.haptics", desc: "settings.hapticsNote" },
          { key: "motion" as const, title: "settings.motion", desc: "settings.motionNote" }
        ].map(({ key, title, desc }) => (
          <div className="setting-row" key={key}>
            <div>
              <h3>{t(lang, title)}</h3>
              <p>{t(lang, desc)}</p>
            </div>
            <Toggle
              checked={game.settings[key]}
              label={t(lang, title)}
              onChange={() => onSettings({ [key]: !game.settings[key] })}
            />
          </div>
        ))}
      </section>

      <section className="setting-themes">
        <div className="setting-section-title">
          <span>{t(lang, "settings.theme")}</span>
          <small>{lang === "zh" ? "院上 · 天色" : "THE SKY ABOVE"}</small>
        </div>
        <div className="theme-row">
          {themeOptions.map((theme) => {
            const unlocked = game.purchasedThemes.includes(theme.id);
            const available = game.levelId >= theme.unlock;
            const active = game.theme === theme.id;
            return (
              <button
                key={theme.id}
                className={`theme-card theme-${theme.id} ${active ? "active" : ""} ${!available ? "locked" : ""}`}
                onClick={() => available && onTheme(theme.id)}
              >
                <span className="theme-swatch">
                  <MoonStar size={18}/>
                  <i/>
                </span>
                <b>{t(lang, theme.key)}</b>
                <small>
                  {active
                    ? <Check size={12}/>
                    : unlocked
                      ? t(lang, "shop.useTheme")
                      : available
                        ? `${theme.price} ${t(lang, "top.coins")}`
                        : t(lang, "theme.locked", { n: theme.unlock })}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      <section className="setting-actions">
        <button onClick={onHowTo}>
          <BookOpen size={16}/>
          <span>{t(lang, "settings.rules")}</span>
          <ChevronRight size={15}/>
        </button>
        {!standalone && (
          <button onClick={onInstall}>
            <Download size={16}/>
            <span>{t(lang, "settings.install")}</span>
            <ChevronRight size={15}/>
          </button>
        )}
        <div className="save-note">
          <span><Check size={12}/>{t(lang, "settings.saved")}</span>
          <small>{t(lang, "settings.about")}</small>
        </div>
      </section>

      <button className="reset-link" onClick={() => setConfirmReset(true)}>
        <RotateCcw size={13}/>
        {t(lang, "settings.reset")}
      </button>

      {confirmReset && (
        <div className="confirm-layer">
          <div className="confirm-card">
            <span className="confirm-icon"><Info size={18}/></span>
            <h3>{t(lang, "settings.resetTitle")}</h3>
            <p>{t(lang, "settings.resetCopy")}</p>
            <div>
              <button className="quiet-button" onClick={() => setConfirmReset(false)}>
                {t(lang, "common.cancel")}
              </button>
              <button className="danger-button" onClick={onReset}>
                {t(lang, "settings.resetConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </SheetFrame>
  );
}

export function JourneySheet({ game, onClose }: SheetBaseProps) {
  const { lang } = game.settings;
  return (
    <SheetFrame
      lang={lang}
      kicker={t(lang, "journey.kicker")}
      title={t(lang, "journey.title")}
      onClose={onClose}
      wide
      className="journey-sheet"
    >
      <p className="journey-intro">{t(lang, "journey.copy")}</p>
      <div className="chapter-list">
        {CHAPTERS.map((chapter) => (
          <section className="chapter-group" key={chapter.id}>
            <header>
              <div>
                <span>{localized(chapter.label, lang)}</span>
                <h3>{localized(chapter.title, lang)}</h3>
              </div>
              <p>{localized(chapter.line, lang)}</p>
            </header>
            <div className="level-grid">
              {LEVELS.filter((level) => level.chapter === chapter.id).map((level) => {
                const done = game.completed.includes(level.id);
                const current = game.levelId === level.id;
                const locked = level.id > game.levelId && !done;
                return (
                  <div
                    className={`level-cell ${done ? "done" : ""} ${current ? "current" : ""} ${locked ? "locked" : ""}`}
                    key={level.id}
                  >
                    <span>{done ? <Check size={12}/> : String(level.id).padStart(2, "0")}</span>
                    <b>{localized(level.name, lang)}</b>
                    <small>
                      {current
                        ? t(lang, "journey.current")
                        : done
                          ? t(lang, "journey.done")
                          : locked
                            ? t(lang, "journey.locked")
                            : t(lang, "journey.current")}
                    </small>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </SheetFrame>
  );
}

export function StorySheet({ game, onClose }: SheetBaseProps) {
  const { lang } = game.settings;
  const chapter = getChapter(game.levelId);
  const level = getLevel(game.levelId);

  return (
    <SheetFrame
      lang={lang}
      kicker={localized(chapter.label, lang)}
      title={localized(level.name, lang)}
      onClose={onClose}
      className="story-sheet"
    >
      <div className="story-portrait">
        <img src="./assets/zhi.svg" alt=""/>
        <span>{lang === "zh" ? "阿栀" : "ZHI"}</span>
      </div>
      <blockquote>{localized(chapter.story, lang)}</blockquote>
      <div className="story-rule"><i/><span>{lang === "zh" ? "小院" : "THE GARDEN"}</span><i/></div>
      <p>{localized(chapter.line, lang)}</p>
      <button className="wide-soft-button" onClick={onClose}>
        {lang === "zh" ? "把话收好" : "Keep the words"}
        <ArrowLeft size={14}/>
      </button>
    </SheetFrame>
  );
}

export function TutorialOverlay({
  lang,
  onClose,
  fromSettings = false
}: {
  lang: Lang;
  onClose: () => void;
  fromSettings?: boolean;
}) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <div className="tutorial-branch"/>
        <button className="round-close" onClick={onClose} aria-label={t(lang, "aria.close")}>
          <X size={18}/>
        </button>
        <span className="tutorial-kicker">{t(lang, "tutorial.kicker")}</span>
        <h2>{t(lang, "tutorial.title")}</h2>
        <p className="tutorial-copy">{t(lang, "tutorial.copy")}</p>
        <div className="tutorial-steps">
          {[1, 2, 3].map((step) => (
            <article key={step}>
              <span className="tutorial-number">0{step}</span>
              <div className="tutorial-step-icon">
                {step === 1 && <Droplets size={23}/>}
                {step === 2 && <span className="merge-mini">5<i>→</i>2</span>}
                {step === 3 && <MoonStar size={23}/>}
              </div>
              <h3>{t(lang, `tutorial.step${step}Title`)}</h3>
              <p>{t(lang, `tutorial.step${step}Copy`)}</p>
            </article>
          ))}
        </div>
        <button className="primary-button tutorial-start" onClick={onClose}>
          {fromSettings ? t(lang, "common.close") : t(lang, "tutorial.start")}
        </button>
        <small className="tutorial-note">{t(lang, "tutorial.note")}</small>
      </div>
    </div>
  );
}

export function CompletionModal({
  game,
  onNext,
  onStay,
  onReplay
}: {
  game: GameData;
  onNext: () => void;
  onStay: () => void;
  onReplay: () => void;
}) {
  const { lang } = game.settings;
  const final = game.completed.length >= LEVELS.length;
  const coins = 24 + game.levelId * 2 + (game.levelId === 1 ? 10 : 0);
  const dream = 8 + Math.ceil(game.levelId / 3);

  return (
    <div className="completion-overlay">
      <div className="completion-glow"/>
      <div className="completion-card">
        <div className="completion-moon">
          <MoonStar size={36}/>
          <i/><i/><i/>
        </div>
        <span className="completion-kicker">{t(lang, "complete.kicker", { n: game.levelId })}</span>
        <h2>{final ? t(lang, "complete.finalTitle") : t(lang, "complete.title")}</h2>
        <p>{final ? t(lang, "complete.finalCopy") : t(lang, "complete.copy")}</p>
        <div className="reward-line">
          <span><Flower2 size={14}/>+{coins}</span>
          <span><Sparkles size={14}/>+{dream}</span>
        </div>
        <div className="completion-actions">
          <button className="quiet-button" onClick={final ? onReplay : onStay}>
            {final ? t(lang, "complete.finalAgain") : t(lang, "complete.stay")}
          </button>
          {!final && (
            <button className="primary-button" onClick={onNext}>
              {t(lang, "complete.next")}
              <ChevronRight size={15}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
