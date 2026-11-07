import { chromium } from "playwright";
import sharp from "sharp";
import { existsSync } from "node:fs";

const baseUrl = process.env.GAME_URL ?? "http://127.0.0.1:4173/";
const views = [
  { name: "horizon-360", width: 360, height: 640, deviceScaleFactor: 1 },
  { name: "horizon-390", width: 390, height: 844, deviceScaleFactor: 1 },
  { name: "horizon-desktop", width: 1440, height: 900, deviceScaleFactor: 1 }
];
const boardMasks = [
  [],
  [0, 1, 5, 6, 7, 13, 35, 41, 42, 43, 47, 48],
  [0, 6, 3, 10, 17, 24, 31, 38, 45, 42, 48],
  [0, 1, 5, 6, 7, 12, 13, 35, 36, 41, 42, 43, 47, 48],
  [0, 6, 42, 48, 7, 13, 35, 41, 14, 20, 28, 34],
  [0, 1, 5, 6, 7, 13, 14, 20, 27, 28, 34, 35, 36, 41, 42, 43, 47, 48]
];
const boardCases = [
  { name: "terrace", levelId: 19, layout: 1 },
  { name: "moon-bay", levelId: 14, layout: 2 },
  { name: "brook-steps", levelId: 16, layout: 3 },
  { name: "flower-cross", levelId: 15, layout: 4 },
  { name: "orchard-isles", levelId: 13, layout: 5 },
  { name: "moon-court", levelId: 18, layout: 6 }
];

function gameState(levelId, board = null) {
  return {
    started: true,
    levelId,
    board,
    settings: {
      lang: "zh",
      sound: false,
      haptics: false,
      motion: true,
      tutorialDone: true
    }
  };
}

function populatedBoard(layout, levelId) {
  const inactive = new Set(boardMasks[layout - 1]);
  const kinds = ["wood", "flower", "tea", "koi"];
  const board = Array.from({ length: 49 }, () => null);
  board.forEach((_, index) => {
    if (inactive.has(index) || index % 7 === 1) return;
    const kind = kinds[(index + layout) % kinds.length];
    const itemLevel = 1 + ((index * 3 + layout) % 5);
    board[index] = {
      id: `capture-${levelId}-${index}`,
      type: "item",
      kind,
      level: itemLevel
    };
  });
  return board;
}

const localEdge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.BROWSER_PATH ?? (existsSync(localEdge) ? localEdge : undefined);
const browser = await chromium.launch({ headless: true, executablePath });

async function openGame(view, state) {
  const context = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: view.deviceScaleFactor,
    locale: "zh-CN"
  });
  await context.addInitScript((save) => {
    localStorage.setItem("guiting-shiguang-save-v1", JSON.stringify(save));
  }, state);

  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".cover-enter").click();
  await page.locator(".board-panel").waitFor();
  await page.waitForTimeout(800);
  return { context, page };
}

for (const view of views) {
  const { context, page } = await openGame(view, gameState(1));

  const metrics = await page.evaluate(() => {
    const panel = document.querySelector(".board-panel")?.getBoundingClientRect();
    const stage = document.querySelector(".board-stage")?.getBoundingClientRect();
    const frame = document.querySelector(".board-frame")?.getBoundingClientRect();
    const cells = [...document.querySelectorAll(".board-cell")];
    const first = cells[0]?.getBoundingClientRect();
    const last = cells.at(-1)?.getBoundingClientRect();
    return {
      panel: panel && { top: panel.top, bottom: panel.bottom, height: panel.height },
      stage: stage && { top: stage.top, bottom: stage.bottom, height: stage.height },
      frame: frame && { top: frame.top, bottom: frame.bottom, width: frame.width, height: frame.height },
      first: first && { left: first.left, top: first.top, width: first.width, height: first.height },
      last: last && { left: last.left, top: last.top, width: last.width, height: last.height },
      cellCount: cells.length
    };
  });

  console.log(view.name, JSON.stringify(metrics));
  await page.screenshot({
    path: `screens/${view.name}.png`,
    fullPage: false
  });
  await context.close();
}

const boardShots = [];
for (const boardCase of boardCases) {
  const view = { width: 390, height: 844, deviceScaleFactor: 1 };
  const state = gameState(boardCase.levelId, populatedBoard(boardCase.layout, boardCase.levelId));
  const { context, page } = await openGame(view, state);
  const file = `screens/board-${boardCase.name}.png`;
  await page.screenshot({ path: file, fullPage: false });
  boardShots.push({ ...boardCase, file });
  await context.close();
}

const thumbWidth = 260;
const thumbHeight = 563;
const labelHeight = 34;
const gap = 12;
const montage = sharp({
  create: {
    width: thumbWidth * 3 + gap * 4,
    height: (thumbHeight + labelHeight) * 2 + gap * 3,
    channels: 4,
    background: "#efe3dc"
  }
});
const composites = [];
for (let index = 0; index < boardShots.length; index += 1) {
  const x = gap + (index % 3) * (thumbWidth + gap);
  const y = gap + Math.floor(index / 3) * (thumbHeight + labelHeight + gap);
  const image = await sharp(boardShots[index].file).resize(thumbWidth, thumbHeight).png().toBuffer();
  const label = await sharp(Buffer.from(
    `<svg width="${thumbWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="8" fill="#f8f1e8"/>
      <text x="12" y="23" fill="#745a67" font-size="15" font-family="Microsoft YaHei, sans-serif">${boardShots[index].name}</text>
    </svg>`
  )).png().toBuffer();
  composites.push({ input: image, left: x, top: y });
  composites.push({ input: label, left: x, top: y + thumbHeight });
}
await montage.composite(composites).png().toFile("screens/horizon-board-variants.png");

await browser.close();
