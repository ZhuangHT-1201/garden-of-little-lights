import { Check, ChevronRight, Send } from "lucide-react";
import type { Cell, GameData, Goal } from "../game/types";
import { getLevel, itemName, LEVELS } from "../game/levels";
import { t } from "../game/i18n";
import ItemArt from "./ItemArt";

interface GoalCardProps {
  game: GameData;
  board: Cell[];
  onDeliver: () => void;
  onStory: () => void;
  onNext: () => void;
}

function countGoal(board: Cell[], goal: Goal): number {
  return board.filter((cell) => cell?.type === "item" && cell.kind === goal.kind && cell.level === goal.level).length;
}

export default function GoalCard({ game, board, onDeliver, onStory, onNext }: GoalCardProps) {
  const { lang } = game.settings;
  const level = getLevel(game.levelId);
  const complete = level.goals.every((goal) => countGoal(board, goal) >= goal.count);
  const finished = game.completed.includes(game.levelId);
  const final = finished && game.completed.length >= LEVELS.length;

  return (
    <section className={`goal-card ${complete && !finished ? "is-ready" : ""} ${finished ? "is-finished" : ""}`}>
      <button className="goal-avatar" onClick={onStory} aria-label={t(lang, "goal.story")}>
        <img src="./assets/zhi.svg" alt=""/>
        <span />
      </button>
      <div className="goal-content">
        <div className="goal-heading">
          <span>{finished ? t(lang, "goal.complete", { n: game.levelId }) : t(lang, "goal.label")}</span>
          <button className="goal-story-link" onClick={onStory}>
            {t(lang, "story.title")}
            <ChevronRight size={12}/>
          </button>
        </div>
        {finished ? (
          <div className="goal-finished-line">
            <span><Check size={12}/></span>
            <b>{level.goals.map((goal) => itemName(goal.kind, goal.level, lang)).join(" · ")}</b>
            <small>{t(lang, "journey.done")}</small>
          </div>
        ) : (
          <div className="goal-items">
            {level.goals.map((goal) => {
              const count = countGoal(board, goal);
              const ready = count >= goal.count;
              return (
                <div className={`goal-item ${ready ? "ready" : ""}`} key={`${goal.kind}-${goal.level}`}>
                  <div className="goal-art">
                    <ItemArt kind={goal.kind} level={goal.level}/>
                    {ready && <span className="goal-check"><Check size={10}/></span>}
                  </div>
                  <div>
                    <b>{itemName(goal.kind, goal.level, lang)}</b>
                    <small>{t(lang, "board.level", { n: goal.level })}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <button
        className="deliver-button"
        onClick={finished ? onNext : onDeliver}
        disabled={!complete && !finished}
      >
        {finished ? <ChevronRight size={16}/> : <Send size={15}/>}
        <span>{finished ? (final ? t(lang, "goal.again") : t(lang, "goal.next")) : t(lang, "goal.offer")}</span>
      </button>
    </section>
  );
}
