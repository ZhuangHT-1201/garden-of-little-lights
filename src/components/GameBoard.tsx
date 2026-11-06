import { useRef, useState } from "react";
import { Droplets, Sparkles } from "lucide-react";
import type { Cell, GameData, GameEvent, Kind, MergeMode } from "../game/types";
import { getChapter, getLevel, ITEMS, itemName, localized } from "../game/levels";
import { gatherLevelFor, MAX_DEW } from "../game/engine";
import { t } from "../game/i18n";
import ItemArt from "./ItemArt";

interface GameBoardProps {
  game: GameData;
  selected: number | null;
  hint: [number, number] | null;
  mergeEvent: GameEvent | null;
  onTapCell: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onSelectKind: (kind: Kind) => void;
  onGather: () => void;
  onMergeMode: (mode: MergeMode) => void;
  onUndo: () => void;
  onAutoMerge: () => void;
  onHint: () => void;
}

interface DragState {
  from: number;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
}

function FogArt({ label, mark }: { label: string; mark: string }) {
  return (
    <div className="fog-art">
      <span className="fog-ring ring-one"/>
      <span className="fog-ring ring-two"/>
      <i/>
      <b>{mark}</b>
      <small>{label}</small>
    </div>
  );
}

export default function GameBoard({
  game,
  selected,
  hint,
  mergeEvent,
  onTapCell,
  onMove,
  onSelectKind,
  onGather,
  onMergeMode,
  onUndo,
  onAutoMerge,
  onHint
}: GameBoardProps) {
  const { lang } = game.settings;
  const level = getLevel(game.levelId);
  const chapter = getChapter(game.levelId);
  const gatherLevel = gatherLevelFor(game.selectedKind, game.levelId);
  const inactiveCells = new Set(level.inactive);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [drop, setDrop] = useState<number | null>(null);

  const findCell = (x: number, y: number): number | null => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
    const hit = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-cell-index]");
    if (!hit || !board.contains(hit)) return null;
    const index = Number(hit.dataset.cellIndex);
    return Number.isFinite(index) ? index : null;
  };

  const pointerDown = (event: React.PointerEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const next: DragState = {
      from: index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      moved: false
    };
    dragRef.current = next;
    setDrag(next);
  };

  const pointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    event.preventDefault();
    const moved = current.moved || Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 7;
    const next = { ...current, x: event.clientX, y: event.clientY, moved };
    dragRef.current = next;
    setDrag(next);
    setDrop(moved ? findCell(event.clientX, event.clientY) : null);
  };

  const pointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const target = findCell(event.clientX, event.clientY);
    if (current.moved) {
      if (target !== null && target !== current.from) onMove(current.from, target);
    } else {
      onTapCell(current.from);
    }
    dragRef.current = null;
    setDrag(null);
    setDrop(null);
  };

  const pointerCancel = () => {
    dragRef.current = null;
    setDrag(null);
    setDrop(null);
  };

  const draggedCell = drag?.moved && drag.from >= 0 ? game.board[drag.from] : null;

  return (
    <section className={`board-panel board-chapter-${level.chapter} board-layout-${level.layout}`}>
      <div className="board-header">
        <div className="kind-picker">
          {level.available.map((kind) => (
            <button
              key={kind}
              className={`kind-button ${game.selectedKind === kind ? "active" : ""}`}
              onClick={() => onSelectKind(kind)}
              title={localized(ITEMS[kind].label, lang)}
              aria-pressed={game.selectedKind === kind}
            >
              <span className="kind-art"><ItemArt kind={kind} level={gatherLevelFor(kind, game.levelId)}/></span>
              <span>{localized(ITEMS[kind].short, lang)}</span>
            </button>
          ))}
        </div>
        <button className="gather-button" onClick={onGather}>
          <span className="gather-art">
            <ItemArt kind={game.selectedKind} level={gatherLevel}/>
            <i className="gather-plus">+</i>
          </span>
          <span className="gather-copy">
            <b>{t(lang, "board.gather")}</b>
            <small><Droplets size={11}/>1 · {game.dew}/{MAX_DEW}</small>
          </span>
        </button>
      </div>

      <div className="merge-toolbar">
        <div className="mode-switch" role="group" aria-label={t(lang, "merge.modalTitle")}>
          <button
            className={game.mergeMode === 5 ? "active" : ""}
            onClick={() => onMergeMode(5)}
            aria-pressed={game.mergeMode === 5}
          >
            <span className="mode-glyph">5<i>→</i>2</span>
            <span>{t(lang, "board.five")}</span>
          </button>
          <button
            className={game.mergeMode === 3 ? "active" : ""}
            onClick={() => onMergeMode(3)}
            aria-pressed={game.mergeMode === 3}
          >
            <span className="mode-glyph">3<i>→</i>1</span>
            <span>{t(lang, "board.three")}</span>
          </button>
        </div>
        <div className="board-tools">
          <button onClick={onUndo} disabled={game.undoLeft <= 0}>
            <span>↶</span>
            <b>{t(lang, "board.undo")}</b>
            <small>{game.undoLeft}</small>
          </button>
          <button onClick={onAutoMerge}>
            <Sparkles size={15}/>
            <b>{t(lang, "board.auto")}</b>
          </button>
          <button onClick={onHint}>
            <span className="hint-icon">⌕</span>
            <b>{t(lang, "board.hint")}</b>
          </button>
        </div>
      </div>

      <div className={`board-stage board-world-${level.layout}`}>
        <span className="board-horizon" aria-hidden="true">
          <i/>
          <i/>
          <i/>
        </span>
        <div className={`board-frame board-shape-${level.layout}`}>
          <span className="board-island-base">
            <i/>
            <i/>
            <i/>
          </span>
          <span className="frame-corner corner-tl"/>
          <span className="frame-corner corner-tr"/>
          <span className="frame-corner corner-bl"/>
          <span className="frame-corner corner-br"/>
          <div className="board-grid" ref={boardRef}>
            {game.board.map((cell, index) => {
              if (inactiveCells.has(index)) {
                return <span className="board-void" key={`void-${index}`} aria-hidden="true"/>;
              }
              const isSelected = selected === index;
              const isHint = hint?.includes(index);
              const isDrop = drop === index;
              const isDragging = drag?.moved && drag.from === index;
              const showMerge = mergeEvent?.type === "merge" && mergeEvent.index === index;
              const driftX = ((index * 7 + level.layout * 3) % 5 - 2) * 0.7;
              const driftY = ((index * 5 + level.layout) % 4 - 1.5) * 0.55;
              const driftR = ((index * 11 + level.layout * 4) % 5 - 2) * 0.25;
              const driftScale = 0.975 + ((index * 3 + level.layout) % 4) * 0.012;
              return (
                <button
                  className={[
                    "board-cell",
                    cell?.type === "item" ? "has-item" : "",
                    cell?.type === "fog" ? "has-fog" : "",
                    isSelected ? "is-selected" : "",
                    isHint ? "is-hint" : "",
                    isDrop ? "is-drop" : "",
                    isDragging ? "is-dragging" : ""
                  ].join(" ")}
                  key={cell?.id ?? `empty-${index}`}
                  data-cell-index={index}
                  style={{
                    "--drift-x": `${driftX}px`,
                    "--drift-y": `${driftY}px`,
                    "--drift-r": `${driftR}deg`,
                    "--drift-scale": driftScale,
                    "--cell-row": Math.floor(index / 6)
                  } as React.CSSProperties}
                  onPointerDown={(event) => pointerDown(event, index)}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  onPointerCancel={pointerCancel}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onTapCell(index);
                    }
                  }}
                  aria-label={
                    cell?.type === "item"
                      ? t(lang, "aria.tile", {
                          item: itemName(cell.kind, cell.level, lang),
                          level: cell.level
                        })
                      : cell?.type === "fog"
                        ? t(lang, "board.fogCost")
                        : t(lang, "board.tap")
                  }
                >
                  <span className="cell-inset"/>
                  {cell?.type === "item" && <span className="tile-ground-shadow"/>}
                  {cell?.type === "item" && (
                    <span className={`tile ${showMerge ? "just-merged" : ""}`}>
                      <span className="tile-paper"/>
                      <ItemArt kind={cell.kind} level={cell.level} className="tile-art"/>
                      <span className="tile-level">{cell.level}</span>
                      {cell.level >= 5 && <span className="tile-glimmer"/>}
                    </span>
                  )}
                  {cell?.type === "fog" && (
                    <span className="tile tile-fog">
                      <FogArt label={t(lang, "board.fog")} mark={lang === "zh" ? "雾" : "M"}/>
                    </span>
                  )}
                  {cell === null && <span className="empty-mark"/>}
                  {showMerge && <span className="merge-pulse" key={mergeEvent.id}/>}
                </button>
              );
            })}
          </div>
        </div>
        <span className="board-scene-ornament ornament-shrub shrub-left" aria-hidden="true"><i/><i/><i/></span>
        <span className="board-scene-ornament ornament-shrub shrub-right" aria-hidden="true"><i/><i/><i/></span>
        <span className="board-scene-ornament ornament-lantern" aria-hidden="true"><i/><b/></span>
        <span className="board-scene-ornament ornament-stones" aria-hidden="true"><i/><i/><i/></span>
        <span className="board-petals" aria-hidden="true">
          <i/><i/><i/><i/><i/><i/>
        </span>
      </div>
      <div className="board-footnote">
        <span>{t(lang, "board.tap")}</span>
        <i/>
        <span>{game.mergeMode === 5 ? t(lang, "board.fiveHint") : t(lang, "board.threeHint")}</span>
      </div>
      <div className="board-lullaby">
        <span className="lullaby-line"/>
        <div>
          <small>{localized(chapter.label, lang)}</small>
          <b>{localized(chapter.title, lang)}</b>
          <p>{localized(chapter.line, lang)}</p>
        </div>
        <span className="lullaby-seal">{lang === "zh" ? "光" : "L"}</span>
      </div>

      {draggedCell?.type === "item" && drag && (
        <div
          className="drag-ghost"
          style={{ left: drag.x, top: drag.y }}
        >
          <ItemArt kind={draggedCell.kind} level={draggedCell.level}/>
        </div>
      )}
    </section>
  );
}
