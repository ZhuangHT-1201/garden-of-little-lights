import type { Goal, Kind, Lang, Level, Localized } from "./types";

export interface Chapter {
  id: number;
  label: Localized;
  title: Localized;
  line: Localized;
  story: Localized;
}

export interface ItemMeta {
  kind: Kind;
  label: Localized;
  short: Localized;
  color: string;
  levels: Localized[];
  lore: Localized[];
}

export const BOARD_SIZE = 6;
export const MAX_LEVEL = 6;

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    label: { zh: "壹 · 花门", en: "I · Garden Gate" },
    title: { zh: "今天也慢慢来", en: "Take Today Slowly" },
    line: { zh: "风吹开一条门缝，正好够我们走进小院。", en: "The wind opens a little gap in the gate, just wide enough to step inside." },
    story: {
      zh: "阿栀在花门边等你，篮子里装着几枝新剪的桂花。她说今天不用赶，先收光，再喝茶。",
      en: "Zhi waits by the garden gate, her basket full of freshly cut osmanthus. No need to hurry today, she says. Gather a little light first, then we'll have tea."
    }
  },
  {
    id: 2,
    label: { zh: "贰 · 暖房", en: "II · Glasshouse" },
    title: { zh: "茶热着，花慢慢开", en: "Warm Tea, Slow Blooms" },
    line: { zh: "玻璃顶上落着雨，茶壶正小声冒热气。", en: "Rain taps the glass roof while the teapot hums softly." },
    story: {
      zh: "暖房里都是湿润的花香。阿栀把茶杯推到你面前，杯沿画着一圈很小的白花。",
      en: "The glasshouse smells of rain and petals. Zhi slides a teacup toward you, a tiny ring of white flowers painted around its rim."
    }
  },
  {
    id: 3,
    label: { zh: "叁 · 浅溪", en: "III · Little Brook" },
    title: { zh: "灯亮时，鱼会回来", en: "When the Lamp Is Lit" },
    line: { zh: "不需要喊它，灯亮着，小鲤鱼自己认得路。", en: "No need to call. Once the lamp is lit, the little koi knows the way home." },
    story: {
      zh: "浅溪绕着小院打了个弯。阿栀蹲在石头上数鱼，数到第七条时，忘了自己数到哪里。",
      en: "The brook curves around the garden. Zhi crouches on a stone and counts the koi. At number seven, she loses track and starts again."
    }
  },
  {
    id: 4,
    label: { zh: "肆 · 月台", en: "IV · Moon Terrace" },
    title: { zh: "把满院的光收进相册", en: "The Garden, Kept in Light" },
    line: { zh: "月亮走到最高处时，今天的每一页都可以好好收起来了。", en: "When the moon reaches its highest point, every page of today can be tucked away safely." },
    story: {
      zh: "最后一页手账只差几张照片。花、茶、木头和小鲤都准备好了，阿栀把相机放在月台上。",
      en: "The last page needs only a few photographs. Flowers, tea, wood and the little koi are all ready. Zhi sets the camera on the moon terrace."
    }
  }
];

const levelData: Array<{
  chapter: number;
  name: Localized;
  goals: Array<[Kind, number]>;
  available: Kind[];
}> = [
  { chapter: 1, name: { zh: "小门初开", en: "The Gate Opens" }, goals: [["wood", 3]], available: ["wood"] },
  { chapter: 1, name: { zh: "新木有香", en: "Fresh Timber" }, goals: [["wood", 4]], available: ["wood"] },
  { chapter: 1, name: { zh: "石阶边开花了", en: "Flowers by the Steps" }, goals: [["flower", 3]], available: ["wood", "flower"] },
  { chapter: 1, name: { zh: "桂花来信", en: "Osmanthus Note" }, goals: [["flower", 4]], available: ["wood", "flower"] },
  { chapter: 1, name: { zh: "花木做朋友", en: "A Little Gathering" }, goals: [["wood", 4], ["flower", 3]], available: ["wood", "flower"] },
  { chapter: 1, name: { zh: "一篮小花香", en: "A Basket of Bloom" }, goals: [["flower", 5]], available: ["wood", "flower"] },
  { chapter: 2, name: { zh: "茶壶冒热气", en: "First Warm Tea" }, goals: [["tea", 3]], available: ["wood", "flower", "tea"] },
  { chapter: 2, name: { zh: "一杯慢慢喝", en: "Sip It Slowly" }, goals: [["tea", 4]], available: ["wood", "flower", "tea"] },
  { chapter: 2, name: { zh: "月光落进茶杯", en: "Moon in a Cup" }, goals: [["wood", 5]], available: ["wood", "flower", "tea"] },
  { chapter: 2, name: { zh: "花与茶同桌", en: "Bloom & Tea" }, goals: [["flower", 5], ["tea", 4]], available: ["wood", "flower", "tea"] },
  { chapter: 2, name: { zh: "暖茶留人", en: "Stay for Tea" }, goals: [["tea", 5]], available: ["wood", "flower", "tea"] },
  { chapter: 2, name: { zh: "花门小满", en: "A Full Little Gate" }, goals: [["wood", 5], ["tea", 4]], available: ["wood", "flower", "tea"] },
  { chapter: 3, name: { zh: "浅溪来客", en: "A Guest at the Brook" }, goals: [["koi", 3]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 3, name: { zh: "鳞片亮亮的", en: "Bright Little Scales" }, goals: [["koi", 4]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 3, name: { zh: "茶暖，灯也暖", en: "Warm Tea, Warm Lamp" }, goals: [["tea", 5], ["koi", 4]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 3, name: { zh: "满院桂花", en: "A Courtyard of Osmanthus" }, goals: [["flower", 6]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 3, name: { zh: "云朵上挂灯", en: "Lamps on Clouds" }, goals: [["wood", 6], ["koi", 4]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 3, name: { zh: "茶香引鲤", en: "Tea Draws the Koi" }, goals: [["koi", 5], ["tea", 5]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "花影落在木窗", en: "Blossom on the Window" }, goals: [["wood", 6], ["flower", 5]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "月亮来喝茶", en: "The Moon Comes for Tea" }, goals: [["tea", 6]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "灯台留客", en: "A Lamp for a Guest" }, goals: [["wood", 6], ["tea", 5]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "花与鲤同游", en: "Bloom and Koi" }, goals: [["flower", 6], ["koi", 5]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "小鲤回家", en: "Little Koi Comes Home" }, goals: [["koi", 6], ["wood", 5]], available: ["wood", "flower", "tea", "koi"] },
  { chapter: 4, name: { zh: "桂庭拾光", en: "Garden of Little Lights" }, goals: [["wood", 6], ["koi", 6]], available: ["wood", "flower", "tea", "koi"] }
];

const fogPatterns = [
  [],
  [0, 5],
  [30, 35],
  [0, 5, 30],
  [0, 5, 30, 35],
  [2, 3, 32, 33],
  [0, 1, 34, 35],
  [0, 5, 30, 35],
  [0, 1, 2, 33, 34, 35],
  [0, 5, 12, 23, 30, 35],
  [0, 5, 30, 35],
  [0, 1, 3, 4, 30, 32, 34, 35],
  [0, 5, 30, 35],
  [0, 1, 34, 35],
  [0, 5, 12, 23, 30, 35],
  [0, 5, 30, 35],
  [0, 1, 2, 33, 34, 35],
  [0, 5, 30, 35],
  [0, 1, 34, 35],
  [0, 5, 12, 23, 30, 35],
  [0, 1, 2, 33, 34, 35],
  [0, 5, 30, 35],
  [0, 1, 34, 35],
  [0, 5, 30, 35]
];

const boardLayouts = [
  [],
  [0, 5, 6, 11, 24, 29, 30, 35],
  [2, 3, 8, 9, 14, 15, 20, 21, 26, 27, 32, 33],
  [0, 1, 4, 5, 12, 17, 18, 23, 30, 31, 34, 35],
  [0, 1, 6, 7, 10, 11, 24, 25, 28, 29, 34, 35],
  [0, 1, 4, 5, 12, 23, 24, 29, 30, 35]
];

const levelLayouts = [
  6, 2, 4, 3, 2, 6,
  3, 3, 1, 2, 4, 5,
  5, 2, 6, 3, 4, 5,
  1, 6, 3, 4, 2, 1
];

export const LEVELS: Level[] = levelData.map((entry, index) => ({
  id: index + 1,
  chapter: entry.chapter,
  name: entry.name,
  goals: entry.goals.map(([kind, level]): Goal => ({ kind, level, count: 1 })),
  available: entry.available,
  fog: fogPatterns[index] ?? [],
  layout: levelLayouts[index] ?? 1,
  inactive: boardLayouts[(levelLayouts[index] ?? 1) - 1] ?? []
}));

export const ITEMS: Record<Kind, ItemMeta> = {
  wood: {
    kind: "wood",
    label: { zh: "花木", en: "Garden Findings" },
    short: { zh: "木", en: "WOOD" },
    color: "#b87c67",
    levels: [
      { zh: "小木枝", en: "Little Twig" },
      { zh: "山木", en: "Mountain Timber" },
      { zh: "花藤架", en: "Flower Frame" },
      { zh: "玻璃亭", en: "Glass Pavilion" },
      { zh: "月牙楼", en: "Crescent Tower" },
      { zh: "花窗小楼", en: "Flower Window" }
    ],
    lore: [
      { zh: "风把一枝秋天轻轻放在石阶上。", en: "The wind leaves a branch of autumn on the steps." },
      { zh: "木纹里藏着一场未完的雨。", en: "An unfinished rain sleeps inside the grain." },
      { zh: "花还没有开，架子先替它等。", en: "The flowers have yet to wake; the frame waits for them." },
      { zh: "四面来风，正好坐一会儿。", en: "The wind enters from four sides. Stay a while." },
      { zh: "月色每晚从这里经过。", en: "Moonlight passes this way every night." },
      { zh: "楼不在高处，在看得见归人的地方。", en: "The hall is not high; it simply sees those coming home." }
    ]
  },
  flower: {
    kind: "flower",
    label: { zh: "香花", en: "Soft Bloom" },
    short: { zh: "花", en: "BLOOM" },
    color: "#df96a4",
    levels: [
      { zh: "秋露籽", en: "Dew Seed" },
      { zh: "月芽", en: "Moon Sprout" },
      { zh: "金菊", en: "Golden Mum" },
      { zh: "桂子灯", en: "Osmanthus Lamp" },
      { zh: "琉璃花", en: "Glass Bloom" },
      { zh: "满庭花光", en: "Courtyard in Bloom" }
    ],
    lore: [
      { zh: "小小一粒，收着整座山的香气。", en: "One small seed holds the fragrance of the whole mountain." },
      { zh: "新叶先摸到月光，才肯长大。", en: "The young leaf touches moonlight before it grows." },
      { zh: "霜越薄，金色越亮。", en: "The thinner the frost, the brighter the gold." },
      { zh: "灯芯是桂子，香气也会发光。", en: "Its wick is osmanthus; even the fragrance glows." },
      { zh: "像花，也像一只停在枝头的灯。", en: "Part flower, part lantern resting on its branch." },
      { zh: "把这一院的花期照在一起，今晚就刚刚好。", en: "Every bloom in the courtyard held in one light. Tonight feels just right." }
    ]
  },
  tea: {
    kind: "tea",
    label: { zh: "暖茶", en: "Warm Tea" },
    short: { zh: "茶", en: "TEA" },
    color: "#7c9e82",
    levels: [
      { zh: "云茶芽", en: "Cloud Tea Bud" },
      { zh: "青叶", en: "Green Leaf" },
      { zh: "青团", en: "Herbal Cake" },
      { zh: "松风罐", en: "Pinewind Jar" },
      { zh: "月白茶席", en: "Moonwhite Tea Set" },
      { zh: "满庭茶宴", en: "Courtyard Tea Feast" }
    ],
    lore: [
      { zh: "茶芽上有一点云，水还没开。", en: "A fleck of cloud on the bud. The water is not ready yet." },
      { zh: "青叶上有山雾，也有晴天。", en: "The green leaf holds both mist and clear sky." },
      { zh: "艾草和米香，是春天留下的旧手艺。", en: "Mugwort and rice: a spring craft kept through autumn." },
      { zh: "开罐时，松风会自己出来。", en: "Open the jar and the pinewind comes out." },
      { zh: "一壶一盏，今晚不多不少。", en: "One pot, one cup. Just enough for tonight." },
      { zh: "茶凉了也不要紧，人齐就好。", en: "Cold tea is no matter. Everyone is here." }
    ]
  },
  koi: {
    kind: "koi",
    label: { zh: "游鲤", en: "Pond Koi" },
    short: { zh: "鲤", en: "KOI" },
    color: "#df8a76",
    levels: [
      { zh: "一尾鳞", en: "Single Scale" },
      { zh: "溪鲤", en: "Brook Koi" },
      { zh: "灯下鲤", en: "Lantern Koi" },
      { zh: "锦鳞灯", en: "Brocade Lamp" },
      { zh: "云中鲤", en: "Cloud Carp" },
      { zh: "化月鲤", en: "Moonbound Koi" }
    ],
    lore: [
      { zh: "不知是哪条鱼，把月光落在了岸边。", en: "Somewhere, a fish left a scale of moonlight on the bank." },
      { zh: "溪水太清，小鱼像浮在空气里。", en: "The brook is so clear the little fish seems to swim through air." },
      { zh: "檐下灯一亮，它就从影子里游出来。", en: "When the eaves light up, it swims out of the shadow." },
      { zh: "鳞片薄如纸，灯一照就成锦。", en: "Scales thin as paper turn to brocade under the lamp." },
      { zh: "游得够久，溪流也会变成云。", en: "Swim long enough and even a brook becomes cloud." },
      { zh: "月色终于落下，鱼也终于回家。", en: "Moonlight settles at last. The koi is home." }
    ]
  }
};

export const KIND_ORDER: Kind[] = ["wood", "flower", "tea", "koi"];

export function getLevel(id: number): Level {
  return LEVELS[Math.min(Math.max(id - 1, 0), LEVELS.length - 1)];
}

export function getChapter(id: number): Chapter {
  const level = getLevel(id);
  return CHAPTERS.find((chapter) => chapter.id === level.chapter) ?? CHAPTERS[0];
}

export function localized(value: Localized, lang: Lang): string {
  return value[lang];
}

export function itemName(kind: Kind, level: number, lang: Lang): string {
  return localized(ITEMS[kind].levels[level - 1], lang);
}
