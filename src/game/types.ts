export type Lang = "zh" | "en";
export type Kind = "wood" | "flower" | "tea" | "koi";
export type MergeMode = 3 | 5;
export type ThemeId = "dusk" | "mist" | "lantern";

export interface Item {
  id: string;
  type: "item";
  kind: Kind;
  level: number;
}

export interface FogCell {
  id: string;
  type: "fog";
}

export type Cell = Item | FogCell | null;

export interface Goal {
  kind: Kind;
  level: number;
  count: number;
}

export interface Level {
  id: number;
  chapter: number;
  name: Localized;
  goals: Goal[];
  available: Kind[];
  fog: number[];
  layout: number;
  inactive: number[];
}

export interface Localized {
  zh: string;
  en: string;
}

export interface Settings {
  lang: Lang;
  sound: boolean;
  haptics: boolean;
  motion: boolean;
  tutorialDone: boolean;
}

export interface GameData {
  version: number;
  started: boolean;
  levelId: number;
  board: Cell[];
  mergeMode: MergeMode;
  selectedKind: Kind;
  dew: number;
  coins: number;
  dream: number;
  lastRegen: number;
  discovered: string[];
  completed: number[];
  undoLeft: number;
  totalMerges: number;
  dailyClaimed: string | null;
  settings: Settings;
  theme: ThemeId;
  purchasedThemes: ThemeId[];
}

export type GameEventType =
  | "spawn"
  | "merge"
  | "move"
  | "fog"
  | "notEnough"
  | "noDew"
  | "boardFull"
  | "selected"
  | "undo"
  | "undoEmpty"
  | "shuffle"
  | "buy"
  | "notEnoughCoins"
  | "daily"
  | "deliver"
  | "locked"
  | "hint"
  | "noMerge"
  | "maxLevel"
  | "install"
  | "saved";

export interface GameEvent {
  id: number;
  type: GameEventType;
  kind?: Kind;
  level?: number;
  missing?: number;
  index?: number;
  amount?: number;
  itemId?: string;
}

export interface Snapshot {
  board: Cell[];
  dew: number;
  coins: number;
  dream: number;
  undoLeft: number;
  totalMerges: number;
  discovered: string[];
}

export interface AppState {
  game: GameData;
  history: Snapshot[];
  event: GameEvent | null;
}
