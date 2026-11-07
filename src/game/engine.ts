import { BOARD_SIZE, getLevel, ITEMS, KIND_ORDER, LEVELS, MAX_LEVEL } from "./levels";
import type {
  AppState,
  Cell,
  GameData,
  GameEvent,
  Item,
  Kind,
  Lang,
  MergeMode,
  Settings,
  Snapshot,
  ThemeId
} from "./types";

export const STORAGE_KEY = "guiting-shiguang-save-v1";
export const REGEN_MS = 2 * 60 * 1000;
export const MAX_DEW = 50;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export function localDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

let uidCounter = 0;

function uid(prefix = "i"): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function detectLang(): Lang {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh")) {
    return "zh";
  }
  return "en";
}

function defaultSettings(): Settings {
  return {
    lang: detectLang(),
    sound: true,
    haptics: true,
    motion: true,
    tutorialDone: false
  };
}

function seedRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createBoard(levelId: number): Cell[] {
  const level = getLevel(levelId);
  const random = seedRandom(levelId * 4871 + 19);
  const board: Cell[] = Array.from({ length: TOTAL_CELLS }, () => null);
  const inactive = new Set(level.inactive);
  const activeIndices = board
    .map((_, index) => (inactive.has(index) ? -1 : index))
    .filter((index) => index >= 0);
  const fogIndices = new Set<number>();

  level.fog.forEach((index) => {
    let target = inactive.has(index) ? activeIndices.find((candidate) => !fogIndices.has(candidate)) : index;
    if (target === undefined || fogIndices.has(target)) {
      target = activeIndices.find((candidate) => !fogIndices.has(candidate));
    }
    if (target !== undefined) {
      fogIndices.add(target);
      board[target] = { id: uid("fog"), type: "fog" };
    }
  });

  const seeds: Item[] = [];
  level.goals.forEach((goal) => {
    const seedLevel = Math.max(1, goal.level - 2);
    for (let i = 0; i < 8; i += 1) {
      seeds.push({ id: uid(), type: "item", kind: goal.kind, level: seedLevel });
    }
  });

  level.available.slice(0, 2).forEach((kind) => {
    seeds.push({ id: uid(), type: "item", kind, level: 1 });
  });

  const freeIndices = shuffled(
    board.map((cell, index) => (cell === null && !inactive.has(index) ? index : -1)).filter((index) => index >= 0),
    random
  );
  shuffled(seeds, random).forEach((item, index) => {
    if (freeIndices[index] !== undefined) {
      board[freeIndices[index]] = item;
    }
  });

  return board;
}

function discoveredFromBoard(board: Cell[]): string[] {
  return board
    .filter((cell): cell is Item => cell?.type === "item")
    .map((item) => `${item.kind}-${item.level}`);
}

function sanitizeBoard(board: Cell[], levelId: number): Cell[] {
  const inactive = new Set(getLevel(levelId).inactive);
  if (inactive.size === 0) return board;
  const next = board.map((cell) => (cell ? { ...cell } : null));
  const displaced: Item[] = [];
  inactive.forEach((index) => {
    const cell = next[index];
    if (cell?.type === "item") displaced.push(cell);
    next[index] = null;
  });
  displaced.forEach((item) => {
    const target = next.findIndex((cell, index) => cell === null && !inactive.has(index));
    if (target >= 0) next[target] = item;
  });
  return next;
}

function migrateLegacyBoard(board: Cell[]): Cell[] {
  const next: Cell[] = Array.from({ length: TOTAL_CELLS }, () => null);
  const legacySize = 6;
  for (let index = 0; index < board.length; index += 1) {
    const row = Math.floor(index / legacySize);
    const column = index % legacySize;
    next[(row + 1) * BOARD_SIZE + column + 1] = board[index];
  }
  return next;
}

function migrateBoard(board: Cell[] | undefined | null): Cell[] | null {
  if (!Array.isArray(board)) return null;
  if (board.length === TOTAL_CELLS) return board;
  if (board.length === 36) return migrateLegacyBoard(board);
  return null;
}

export function createGame(lang?: Lang): GameData {
  const board = createBoard(1);
  return {
    version: 1,
    started: false,
    levelId: 1,
    board,
    mergeMode: 5,
    selectedKind: "wood",
    dew: 30,
    coins: 40,
    dream: 0,
    lastRegen: Date.now(),
    discovered: [...new Set(discoveredFromBoard(board))],
    completed: [],
    undoLeft: 3,
    totalMerges: 0,
    dailyClaimed: null,
    settings: { ...defaultSettings(), lang: lang ?? detectLang() },
    theme: "dusk",
    purchasedThemes: ["dusk"]
  };
}

export function applyRegen(game: GameData, now = Date.now()): GameData {
  if (game.dew >= MAX_DEW) {
    return game;
  }
  const elapsed = Math.max(0, now - game.lastRegen);
  const points = Math.floor(elapsed / REGEN_MS);
  if (points <= 0) return game;
  const nextDew = Math.min(MAX_DEW, game.dew + points);
  const consumed = nextDew - game.dew;
  return {
    ...game,
    dew: nextDew,
    lastRegen: nextDew >= MAX_DEW ? now : game.lastRegen + consumed * REGEN_MS
  };
}

export function regenCountdown(game: GameData, now = Date.now()): number {
  if (game.dew >= MAX_DEW) return 0;
  const elapsed = Math.max(0, now - game.lastRegen);
  return Math.max(0, REGEN_MS - (elapsed % REGEN_MS));
}

function normalizeGame(raw: Partial<GameData> | null): GameData {
  const fresh = createGame();
  if (!raw) return fresh;
  const levelId = Math.min(Math.max(Number(raw.levelId) || 1, 1), LEVELS.length);
  const migrated = migrateBoard(raw.board);
  const board = migrated ? sanitizeBoard(migrated, levelId) : createBoard(levelId);
  const settings: Settings = {
    ...fresh.settings,
    ...(raw.settings ?? {})
  };
  return applyRegen({
    ...fresh,
    ...raw,
    levelId,
    board,
    settings,
    discovered: Array.isArray(raw.discovered) ? [...new Set(raw.discovered)] : discoveredFromBoard(board),
    completed: Array.isArray(raw.completed) ? [...new Set(raw.completed)] : [],
    purchasedThemes: Array.isArray(raw.purchasedThemes) ? raw.purchasedThemes : ["dusk"],
    theme: raw.theme ?? "dusk",
    mergeMode: raw.mergeMode === 3 ? 3 : 5,
    selectedKind: raw.selectedKind && getLevel(levelId).available.includes(raw.selectedKind)
      ? raw.selectedKind
      : getLevel(levelId).available[0],
    undoLeft: Number.isFinite(raw.undoLeft) ? Number(raw.undoLeft) : 3
  });
}

export function loadGame(): GameData {
  if (typeof localStorage === "undefined") return createGame();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeGame(JSON.parse(saved) as Partial<GameData>) : createGame();
  } catch {
    return createGame();
  }
}

export function saveGame(game: GameData): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch {
    return;
  }
}

export function createAppState(game = loadGame()): AppState {
  return {
    game: applyRegen(game),
    history: [],
    event: null
  };
}

function event(type: GameEvent["type"], details: Partial<GameEvent> = {}): GameEvent {
  return { id: Date.now() * 1000 + Math.floor(Math.random() * 999), type, ...details };
}

function snapshot(game: GameData): Snapshot {
  return {
    board: game.board.map((cell) => (cell ? { ...cell } : null)),
    dew: game.dew,
    coins: game.coins,
    dream: game.dream,
    undoLeft: game.undoLeft,
    totalMerges: game.totalMerges,
    discovered: [...game.discovered]
  };
}

function withHistory(state: AppState, game: GameData): AppState {
  return {
    ...state,
    game,
    history: [...state.history.slice(-24), snapshot(state.game)]
  };
}

function firstFreeIndex(board: Cell[], levelId: number): number {
  const inactive = new Set(getLevel(levelId).inactive);
  return board.findIndex((cell, index) => cell === null && !inactive.has(index));
}

function itemCount(board: Cell[], kind: Kind, level: number): number {
  return board.filter((cell) => cell?.type === "item" && cell.kind === kind && cell.level === level).length;
}

function gridDistance(a: number, b: number): number {
  const ax = a % BOARD_SIZE;
  const ay = Math.floor(a / BOARD_SIZE);
  const bx = b % BOARD_SIZE;
  const by = Math.floor(b / BOARD_SIZE);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

export function adjacentIndices(index: number): number[] {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  const neighbors: number[] = [];
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue;
      const nextRow = row + rowOffset;
      const nextColumn = column + columnOffset;
      if (nextRow >= 0 && nextRow < BOARD_SIZE && nextColumn >= 0 && nextColumn < BOARD_SIZE) {
        neighbors.push(nextRow * BOARD_SIZE + nextColumn);
      }
    }
  }
  return neighbors;
}

export function areAdjacent(first: number, second: number): boolean {
  return adjacentIndices(first).includes(second);
}

export function connectedItemGroup(board: Cell[], start: number): number[] {
  const anchor = board[start];
  if (anchor?.type !== "item") return [];
  const group: number[] = [];
  const seen = new Set<number>();
  const queue = [start];
  while (queue.length > 0) {
    const index = queue.shift();
    if (index === undefined || seen.has(index)) continue;
    const cell = board[index];
    if (cell?.type !== "item" || cell.kind !== anchor.kind || cell.level !== anchor.level) continue;
    seen.add(index);
    group.push(index);
    queue.push(...adjacentIndices(index));
  }
  return group;
}

export function mergeGroupForPair(
  board: Cell[],
  from: number,
  to: number,
  mode: MergeMode
): number[] | null {
  const source = board[from];
  const target = board[to];
  if (
    source?.type !== "item" ||
    target?.type !== "item" ||
    source.kind !== target.kind ||
    source.level !== target.level ||
    !areAdjacent(from, to)
  ) {
    return null;
  }
  const group = connectedItemGroup(board, to);
  if (!group.includes(from) || group.length < mode) return null;
  const ordered = [to, from, ...group
    .filter((index) => index !== to && index !== from)
    .sort((a, b) => gridDistance(a, to) - gridDistance(b, to))];
  return ordered.slice(0, mode);
}

function consumeGoalItems(board: Cell[], kind: Kind, level: number, count: number): Cell[] {
  const next = board.map((cell) => (cell ? { ...cell } : null));
  let remaining = count;
  for (let index = 0; index < next.length && remaining > 0; index += 1) {
    const cell = next[index];
    if (cell?.type === "item" && cell.kind === kind && cell.level === level) {
      next[index] = null;
      remaining -= 1;
    }
  }
  return next;
}

function mergeItems(game: GameData, from: number, to: number, mode: MergeMode): { game?: GameData; event: GameEvent } {
  const source = game.board[from];
  const target = game.board[to];
  if (source?.type !== "item" || target?.type !== "item") {
    return { event: event("locked") };
  }
  if (source.kind !== target.kind || source.level !== target.level) {
    return { event: event("notEnough", { kind: source.kind, level: source.level, missing: mode }) };
  }
  if (source.level >= MAX_LEVEL) {
    return { event: event("maxLevel", { kind: source.kind, level: source.level }) };
  }

  if (!areAdjacent(from, to)) {
    return { event: event("notAdjacent", { kind: source.kind, level: source.level }) };
  }

  const group = connectedItemGroup(game.board, to);
  if (group.length < mode) {
    return {
      event: event("notEnough", {
        kind: source.kind,
        level: source.level,
        missing: mode - group.length
      })
    };
  }

  const consumed = mergeGroupForPair(game.board, from, to, mode);
  if (!consumed) {
    return { event: event("notAdjacent", { kind: source.kind, level: source.level }) };
  }
  const outputs = mode === 5 ? 2 : 1;
  const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
  consumed.forEach((index) => {
    nextBoard[index] = null;
  });
  const nextLevel = source.level + 1;
  nextBoard[to] = { id: uid(), type: "item", kind: source.kind, level: nextLevel };
  if (outputs === 2) {
    nextBoard[from] = { id: uid(), type: "item", kind: source.kind, level: nextLevel };
  }

  const key = `${source.kind}-${nextLevel}`;
  const totalMerges = game.totalMerges + 1;
  const rewardCoin = totalMerges % 5 === 0 ? 1 : 0;
  return {
    game: {
      ...game,
      board: nextBoard,
      totalMerges,
      coins: game.coins + rewardCoin,
      discovered: game.discovered.includes(key) ? game.discovered : [...game.discovered, key]
    },
    event: event(mode === 5 ? "merge" : "merge", {
      kind: source.kind,
      level: nextLevel,
      index: to,
      amount: outputs,
      indices: outputs === 2 ? [to, from] : [to]
    })
  };
}

function buyTheme(game: GameData, theme: ThemeId): GameData | null {
  const price: Record<ThemeId, number> = { dusk: 0, mist: 55, lantern: 85 };
  const unlockAt: Record<ThemeId, number> = { dusk: 1, mist: 8, lantern: 16 };
  if (game.levelId < unlockAt[theme] && !game.purchasedThemes.includes(theme)) return null;
  if (game.purchasedThemes.includes(theme)) {
    return { ...game, theme };
  }
  if (game.coins < price[theme]) return null;
  return {
    ...game,
    coins: game.coins - price[theme],
    theme,
    purchasedThemes: [...game.purchasedThemes, theme]
  };
}

export type GameAction =
  | { type: "spawn"; kind: Kind }
  | { type: "selectKind"; kind: Kind }
  | { type: "mergeMode"; mode: MergeMode }
  | { type: "move"; from: number; to: number }
  | { type: "clearFog"; index: number }
  | { type: "deliver" }
  | { type: "nextLevel" }
  | { type: "undo" }
  | { type: "shuffle" }
  | { type: "autoMerge" }
  | { type: "hint"; from: number; to: number } | { type: "hintEmpty" }
  | { type: "buy"; item: "dew" | "seed" | "rake" | "shuffle" }
  | { type: "buyTheme"; theme: ThemeId }
  | { type: "daily" }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "start" }
  | { type: "reset" }
  | { type: "tick" }
  | { type: "event"; event: GameEvent };

export function gameReducer(state: AppState, action: GameAction): AppState {
  const { game } = state;

  switch (action.type) {
    case "start": {
      return { ...state, game: { ...game, started: true }, event: null };
    }
    case "tick": {
      const next = applyRegen(game);
      return next === game ? state : { ...state, game: next };
    }
    case "spawn": {
      if (game.dew < 1) return { ...state, event: event("noDew") };
      const level = getLevel(game.levelId);
      if (!level.available.includes(action.kind)) {
        return { ...state, event: event("locked") };
      }
      const index = firstFreeIndex(game.board, game.levelId);
      if (index < 0) return { ...state, event: event("boardFull") };
      const spawnLevel = gatherLevelFor(action.kind, game.levelId);
      const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
      nextBoard[index] = { id: uid(), type: "item", kind: action.kind, level: spawnLevel };
      const key = `${action.kind}-${spawnLevel}`;
      const wasFull = game.dew >= MAX_DEW;
      const nextGame: GameData = {
        ...game,
        board: nextBoard,
        dew: game.dew - 1,
        lastRegen: wasFull ? Date.now() : game.lastRegen,
        selectedKind: action.kind,
        discovered: game.discovered.includes(key) ? game.discovered : [...game.discovered, key]
      };
      return {
        ...withHistory(state, nextGame),
        event: event("spawn", { kind: action.kind, level: spawnLevel, index })
      };
    }
    case "selectKind": {
      if (!getLevel(game.levelId).available.includes(action.kind)) {
        return { ...state, event: event("locked") };
      }
      return {
        ...state,
        game: { ...game, selectedKind: action.kind },
        event: event("selected", { kind: action.kind, level: 1 })
      };
    }
    case "mergeMode": {
      return {
        ...state,
        game: { ...game, mergeMode: action.mode },
        event: null
      };
    }
    case "move": {
      if (action.from === action.to) return state;
      const from = game.board[action.from];
      const to = game.board[action.to];
      if (!from || action.from < 0 || action.to < 0) return state;
      if (getLevel(game.levelId).inactive.includes(action.to)) {
        return { ...state, event: event("locked") };
      }
      if (to?.type === "fog") return { ...state, event: event("locked") };
      if (from.type === "fog") return { ...state, event: event("locked") };
      if (to?.type === "item") {
        if (from.kind === to.kind && from.level === to.level) {
          const result = mergeItems(game, action.from, action.to, game.mergeMode);
          if (!result.game) return { ...state, event: result.event };
          return { ...withHistory(state, result.game), event: result.event };
        }
        const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
        [nextBoard[action.from], nextBoard[action.to]] = [nextBoard[action.to], nextBoard[action.from]];
        return {
          ...withHistory(state, { ...game, board: nextBoard }),
          event: event("move")
        };
      }
      const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
      nextBoard[action.to] = from;
      nextBoard[action.from] = null;
      return {
        ...withHistory(state, { ...game, board: nextBoard }),
        event: event("move")
      };
    }
    case "clearFog": {
      const cell = game.board[action.index];
      if (cell?.type !== "fog") return state;
      if (game.dew < 2) return { ...state, event: event("noDew") };
      const nextBoard = game.board.map((entry) => (entry ? { ...entry } : null));
      nextBoard[action.index] = null;
      return {
        ...withHistory(state, { ...game, board: nextBoard, dew: game.dew - 2 }),
        event: event("fog", { index: action.index })
      };
    }
    case "deliver": {
      const level = getLevel(game.levelId);
      const missing = Math.max(
        0,
        ...level.goals.map((goal) => Math.max(0, goal.count - itemCount(game.board, goal.kind, goal.level)))
      );
      if (missing > 0) {
        const firstGoal = level.goals[0];
        return {
          ...state,
          event: event("notEnough", { kind: firstGoal.kind, level: firstGoal.level, missing })
        };
      }
      let nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
      level.goals.forEach((goal) => {
        nextBoard = consumeGoalItems(nextBoard, goal.kind, goal.level, goal.count);
      });
      const first = game.completed.length === 0;
      const coins = 24 + game.levelId * 2;
      const dream = 8 + Math.ceil(game.levelId / 3);
      const nextGame: GameData = {
        ...game,
        board: nextBoard,
        completed: game.completed.includes(game.levelId)
          ? game.completed
          : [...game.completed, game.levelId],
        coins: game.coins + (first ? coins + 10 : coins),
        dream: game.dream + dream
      };
      return {
        ...withHistory(state, nextGame),
        event: event("deliver", { amount: coins, level: game.levelId })
      };
    }
    case "nextLevel": {
      if (game.levelId >= LEVELS.length) return state;
      const levelId = game.levelId + 1;
      const board = createBoard(levelId);
      const discovered = [
        ...new Set([
          ...game.discovered,
          ...board
            .filter((cell): cell is Item => cell?.type === "item")
            .map((item) => `${item.kind}-${item.level}`)
        ])
      ];
      return {
        ...state,
        history: [],
        game: {
          ...game,
          levelId,
          board,
          selectedKind: getLevel(levelId).goals[0].kind,
          dew: Math.min(MAX_DEW, game.dew + 4),
          undoLeft: 3,
          discovered
        },
        event: null
      };
    }
    case "undo": {
      if (state.history.length === 0) return { ...state, event: event("undoEmpty") };
      if (game.undoLeft <= 0) return { ...state, event: event("undoEmpty") };
      const previous = state.history[state.history.length - 1];
      return {
        ...state,
        history: state.history.slice(0, -1),
        game: {
          ...game,
          board: previous.board.map((cell) => (cell ? { ...cell } : null)),
          dew: previous.dew,
          coins: previous.coins,
          dream: previous.dream,
          undoLeft: Math.max(0, game.undoLeft - 1),
          totalMerges: previous.totalMerges,
          discovered: previous.discovered
        },
        event: event("undo")
      };
    }
    case "shuffle": {
      const random = Math.random;
      const positions = game.board
        .map((cell, index) => (cell?.type === "item" ? index : -1))
        .filter((index) => index >= 0);
      const items = shuffled(
        positions.map((index) => game.board[index]),
        random
      );
      const nextBoard: Cell[] = game.board.map((cell) => (cell?.type === "fog" ? { ...cell } : null));
      positions.forEach((position, index) => {
        nextBoard[position] = items[index];
      });
      return {
        ...withHistory(state, { ...game, board: nextBoard }),
        event: event("shuffle")
      };
    }
    case "autoMerge": {
      const pair = findHint(game.board, game.mergeMode);
      if (!pair) return { ...state, event: event("noMerge") };
      const result = mergeItems(game, pair[0], pair[1], game.mergeMode);
      if (!result.game) return { ...state, event: result.event };
      return { ...withHistory(state, result.game), event: result.event };
    }
    case "hint": {
      return { ...state, event: event("hint", { index: action.from, amount: action.to }) };
    }
    case "hintEmpty": {
      return { ...state, event: event("noMerge") };
    }
    case "buy": {
      if (action.item === "dew") {
        if (game.coins < 26) return { ...state, event: event("notEnoughCoins") };
        return {
          ...state,
          game: {
            ...game,
            coins: game.coins - 26,
            dew: Math.min(MAX_DEW, game.dew + 30)
          },
          event: event("buy", { amount: 30, kind: "wood" })
        };
      }
      if (action.item === "seed") {
        if (game.coins < 16) return { ...state, event: event("notEnoughCoins") };
        const index = firstFreeIndex(game.board, game.levelId);
        if (index < 0) return { ...state, event: event("boardFull") };
        const spawnLevel = gatherLevelFor(game.selectedKind, game.levelId);
        const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
        nextBoard[index] = { id: uid(), type: "item", kind: game.selectedKind, level: spawnLevel };
        return {
          ...withHistory(state, {
            ...game,
            board: nextBoard,
            coins: game.coins - 16
          }),
          event: event("spawn", { kind: game.selectedKind, level: spawnLevel, index })
        };
      }
      if (action.item === "rake") {
        if (game.coins < 10) return { ...state, event: event("notEnoughCoins") };
        const items = game.board
          .map((cell, index) => (cell?.type === "item" ? { index, level: cell.level } : null))
          .filter((entry): entry is { index: number; level: number } => entry !== null)
          .sort((a, b) => a.level - b.level);
        if (items.length === 0) return { ...state, event: event("noMerge") };
        const nextBoard = game.board.map((cell) => (cell ? { ...cell } : null));
        nextBoard[items[0].index] = null;
        return {
          ...withHistory(state, { ...game, board: nextBoard, coins: game.coins - 10 }),
          event: event("buy", { amount: 1 })
        };
      }
      if (game.coins < 8) return { ...state, event: event("notEnoughCoins") };
      const positions = game.board
        .map((cell, index) => (cell?.type === "item" ? index : -1))
        .filter((index) => index >= 0);
      const items = shuffled(
        positions.map((index) => game.board[index]),
        Math.random
      );
      const nextBoard: Cell[] = game.board.map((cell) => (cell?.type === "fog" ? { ...cell } : null));
      positions.forEach((position, index) => {
        nextBoard[position] = items[index];
      });
      return {
        ...withHistory(state, { ...game, board: nextBoard, coins: game.coins - 8 }),
        event: event("shuffle")
      };
    }
    case "buyTheme": {
      const nextGame = buyTheme(game, action.theme);
      if (!nextGame) return { ...state, event: event("notEnoughCoins") };
      return { ...state, game: nextGame, event: event("buy") };
    }
    case "daily": {
      const today = localDateKey();
      if (game.dailyClaimed === today) return state;
      return {
        ...state,
        game: {
          ...game,
          dailyClaimed: today,
          coins: game.coins + 20,
          dew: Math.min(MAX_DEW, game.dew + 10)
        },
        event: event("daily")
      };
    }
    case "settings": {
      return {
        ...state,
        game: {
          ...game,
          settings: { ...game.settings, ...action.patch }
        }
      };
    }
    case "reset": {
      const fresh = createGame(game.settings.lang);
      fresh.settings = { ...game.settings, tutorialDone: true };
      fresh.started = true;
      return { game: fresh, history: [], event: null };
    }
    case "event": {
      return { ...state, event: action.event };
    }
    default:
      return state;
  }
}

export function findHint(board: Cell[], mode: MergeMode): [number, number] | null {
  for (let index = 0; index < board.length; index += 1) {
    const cell = board[index];
    if (cell?.type !== "item" || cell.level >= MAX_LEVEL) continue;
    for (const target of adjacentIndices(index)) {
      if (mergeGroupForPair(board, index, target, mode)) {
        return [index, target];
      }
    }
  }
  return null;
}

export function itemKey(kind: Kind, level: number): string {
  return `${kind}-${level}`;
}

export function gatherLevelFor(kind: Kind, levelId: number): number {
  const goal = getLevel(levelId).goals.find((entry) => entry.kind === kind);
  return goal ? Math.max(1, goal.level - 2) : 1;
}

export function allDiscovered(game: GameData): number {
  return KIND_ORDER.reduce((total, kind) => {
    return total + ITEMS[kind].levels.filter((_, index) => game.discovered.includes(itemKey(kind, index + 1))).length;
  }, 0);
}
