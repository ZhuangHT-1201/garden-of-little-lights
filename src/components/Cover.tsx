import { Flower2, Languages, Volume2, VolumeX } from "lucide-react";
import type { GameData, Lang } from "../game/types";
import { getChapter, getLevel, localized } from "../game/levels";
import { t } from "../game/i18n";

interface CoverProps {
  game: GameData;
  onEnter: () => void;
  onLanguage: (lang: Lang) => void;
  onSound: () => void;
}

export default function Cover({ game, onEnter, onLanguage, onSound }: CoverProps) {
  const { lang } = game.settings;
  const level = getLevel(game.levelId);
  const chapter = getChapter(game.levelId);
  const hasProgress = game.completed.length > 0 || game.levelId > 1;
  const titleClass = lang === "en" ? "cover-title is-english" : "cover-title";

  return (
    <section className="cover">
      <div className="cover-shade" />
      <header className="cover-top">
        <div className="cover-mark">
          <span className="seal">{lang === "zh" ? "栀" : "G"}</span>
          <div>
            <strong>{lang === "zh" ? "桂庭拾光" : "GARDEN OF LIGHT"}</strong>
            <small>{t(lang, "cover.kicker")}</small>
          </div>
        </div>
        <div className="cover-controls">
          <div className="language-switch" role="group" aria-label={t(lang, "aria.language")}>
            <button
              className={lang === "zh" ? "active" : ""}
              onClick={() => onLanguage("zh")}
              aria-pressed={lang === "zh"}
            >
              中文
            </button>
            <button
              className={lang === "en" ? "active" : ""}
              onClick={() => onLanguage("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <button className="cover-icon-button" onClick={onSound} aria-label={t(lang, "aria.sound")}>
            {game.settings.sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}
          </button>
        </div>
      </header>

      <div className="cover-layout">
        <div className="cover-copy">
          <div className="cover-kicker">
            <span className="kicker-line" />
            <Languages size={13}/>
            <span>{localized(chapter.label, lang)}</span>
          </div>
          <h1 className={titleClass}>
            <span>{t(lang, "cover.line1")}</span>
            <span>{t(lang, "cover.line2")}</span>
          </h1>
          <p className="cover-english-title">{t(lang, "cover.english")}</p>
          <p className="cover-subtitle">{t(lang, "cover.subtitle")}</p>
          <div className="cover-actions">
            <button className="primary-button cover-enter" onClick={onEnter}>
              <span className="button-sheen" />
              <span>{hasProgress ? t(lang, "cover.continue") : t(lang, "cover.begin")}</span>
              <i>光</i>
            </button>
            {hasProgress && (
              <p className="continue-note">
                {t(lang, "cover.continueNote", {
                  n: game.levelId,
                  name: localized(level.name, lang)
                })}
              </p>
            )}
          </div>
          <div className="cover-whisper">
            <div className="mini-avatar">
              <img src="./assets/zhi.svg" alt="" />
            </div>
            <div>
              <p>{t(lang, "cover.quote")}</p>
              <span>{t(lang, "cover.quoteBy")}</span>
            </div>
          </div>
        </div>

        <div className="cover-side">
          <div className="cover-moon-card">
            <div className="moon-card-moon" />
            <span className="moon-card-index">IX</span>
            <div className="moon-card-line" />
            <p>{lang === "zh" ? "风来，花开" : "WIND, THEN FLOWERS"}</p>
            <small>{lang === "zh" ? "灯亮，人归" : "A LIGHT, A WAY HOME"}</small>
          </div>
          <div className="cover-keeper">
            <img src="./assets/zhi.svg" alt=""/>
            <div className="keeper-label">
              <span>{lang === "zh" ? "小院主人" : "KEEPER OF THE GARDEN"}</span>
              <b>{lang === "zh" ? "阿栀" : "ZHI"}</b>
            </div>
          </div>
        </div>
      </div>

      <footer className="cover-bottom">
        <div className="cover-note">
          <Flower2 size={13}/>
          <span>{t(lang, "cover.note")}</span>
        </div>
        <span className="cover-edition">GUITING EDITION · 2026</span>
      </footer>
    </section>
  );
}
