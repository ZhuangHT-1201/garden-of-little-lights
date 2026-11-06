import { chromium } from "playwright";
import sharp from "sharp";
import { existsSync } from "node:fs";

const baseUrl = process.env.GAME_URL ?? "http://127.0.0.1:4175/";
const localEdge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.BROWSER_PATH ?? (existsSync(localEdge) ? localEdge : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const masks = [
  [],
  [0, 5, 6, 11, 24, 29, 30, 35],
  [2, 3, 8, 9, 14, 15, 20, 21, 26, 27, 32, 33],
  [0, 1, 4, 5, 12, 17, 18, 23, 30, 31, 34, 35],
  [0, 1, 6, 7, 10, 11, 24, 25, 28, 29, 34, 35],
  [0, 1, 4, 5, 12, 23, 24, 29, 30, 35]
];

function itemBoard(layout, levelId) {
  const inactive = new Set(masks[layout - 1]);
  const kinds = ["wood", "flower", "tea", "koi"];
  return Array.from({ length: 36 }, (_, index) => {
    if (inactive.has(index) || index % 8 === 1) return null;
    return {
      id: `readme-${levelId}-${index}`,
      type: "item",
      kind: kinds[(index + layout) % kinds.length],
      level: 1 + ((index * 3 + layout) % 5)
    };
  });
}

function state(levelId, lang = "en", board = null) {
  return {
    started: true,
    levelId,
    board,
    settings: {
      lang,
      sound: false,
      haptics: false,
      motion: false,
      tutorialDone: true
    }
  };
}

async function openPage({ width, height, initialState, showCover = false, deviceScaleFactor = 1 }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
    locale: "en-US"
  });
  await context.addInitScript((save) => {
    localStorage.setItem("guiting-shiguang-save-v1", JSON.stringify(save));
  }, initialState);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.locator(".cover").waitFor();
  await page.waitForTimeout(650);
  if (!showCover) {
    await page.locator(".cover-enter").click();
    await page.locator(".board-panel").waitFor();
    await page.waitForTimeout(650);
  }
  if (errors.length) throw new Error(errors.join("\n"));
  return { context, page };
}

const cover = await openPage({
  width: 1440,
  height: 900,
  initialState: state(1),
  showCover: true
});
await cover.page.screenshot({ path: "docs/screenshots/cover-en.png" });
await cover.context.close();

const desktop = await openPage({
  width: 1440,
  height: 900,
  initialState: state(13, "en", itemBoard(5, 13))
});
await desktop.page.screenshot({ path: "docs/screenshots/game-en.png" });
await desktop.context.close();

const mobile = await openPage({
  width: 390,
  height: 844,
  initialState: state(13, "en", itemBoard(5, 13))
});
await mobile.page.screenshot({ path: "docs/screenshots/game-mobile-en.png" });
await mobile.page.getByRole("button", { name: "Keepsakes" }).click();
await mobile.page.locator(".bottom-sheet").waitFor();
await mobile.page.waitForTimeout(350);
await mobile.page.screenshot({ path: "docs/screenshots/collection-en.png" });
await mobile.page.locator(".sheet-backdrop").click({ position: { x: 4, y: 4 } }).catch(() => {});
await mobile.page.keyboard.press("Escape");
await mobile.page.waitForTimeout(200);
await mobile.context.close();

const boardCases = [
  { name: "Moon Bay", levelId: 14, layout: 2 },
  { name: "Brook Steps", levelId: 16, layout: 3 },
  { name: "Orchard Isles", levelId: 13, layout: 5 }
];
const boardShots = [];
for (const boardCase of boardCases) {
  const view = await openPage({
    width: 390,
    height: 844,
    initialState: state(boardCase.levelId, "en", itemBoard(boardCase.layout, boardCase.levelId))
  });
  const file = `docs/screenshots/board-${boardCase.layout}.png`;
  await view.page.screenshot({ path: file });
  boardShots.push({ ...boardCase, file });
  await view.context.close();
}

const frameWidth = 300;
const frameHeight = 536;
const labelHeight = 30;
const gap = 12;
const composites = [];
for (let index = 0; index < boardShots.length; index += 1) {
  const x = gap + index * (frameWidth + gap);
  const image = await sharp(boardShots[index].file)
    .extract({ left: 0, top: 0, width: 390, height: 697 })
    .resize(frameWidth, frameHeight)
    .png()
    .toBuffer();
  const label = await sharp(Buffer.from(
    `<svg width="${frameWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="8" fill="#f9f0e7"/>
      <text x="12" y="20" fill="#765967" font-size="14" font-family="Segoe UI, sans-serif">${boardShots[index].name}</text>
    </svg>`
  )).png().toBuffer();
  composites.push({ input: image, left: x, top: gap });
  composites.push({ input: label, left: x, top: gap + frameHeight });
}

await sharp({
  create: {
    width: gap * 4 + frameWidth * 3,
    height: gap * 2 + frameHeight + labelHeight,
    channels: 4,
    background: "#efe2d9"
  }
}).composite(composites).png().toFile("docs/screenshots/board-variants-en.png");

const pwaCover = await openPage({
  width: 390,
  height: 844,
  initialState: state(1, "zh"),
  showCover: true,
  deviceScaleFactor: 3
});
await pwaCover.page.screenshot({ path: "public/screenshots/cover.png" });
await pwaCover.context.close();

const pwaGame = await openPage({
  width: 390,
  height: 844,
  initialState: state(13, "zh", itemBoard(5, 13)),
  deviceScaleFactor: 3
});
await pwaGame.page.screenshot({ path: "public/screenshots/game.png" });
await pwaGame.context.close();

await browser.close();
console.log("English README screenshots captured in docs/screenshots.");
