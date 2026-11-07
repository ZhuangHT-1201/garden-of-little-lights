import { chromium } from "playwright";
import { existsSync } from "node:fs";

const localEdge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath = process.env.BROWSER_PATH ?? (existsSync(localEdge) ? localEdge : undefined);
const browser = await chromium.launch({ headless: true, executablePath });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "zh-CN"
});
const errors = [];
const board = Array.from({ length: 49 }, () => null);
const item = (id, kind, level) => ({ id, type: "item", kind, level });

[22, 23, 24, 29, 30].forEach((index) => {
  board[index] = item(`wood-${index}`, "wood", 1);
});
board[2] = item("wood-far", "wood", 1);
board[31] = item("flower-source", "flower", 1);

await context.addInitScript((save) => {
  localStorage.setItem("guiting-shiguang-save-v1", JSON.stringify(save));
}, {
  started: true,
  levelId: 1,
  board,
  settings: {
    lang: "zh",
    sound: false,
    haptics: false,
    motion: false,
    tutorialDone: true
  }
});

const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto(process.env.GAME_URL ?? "http://127.0.0.1:4173/", {
  waitUntil: "networkidle"
});
await page.locator(".cover-enter").click();
await page.locator(".board-panel").waitFor();

const cellCount = await page.locator(".board-cell").count();
if (cellCount !== 31) {
  throw new Error(`Expected the 7x7 flower-court layout to expose 31 plots, got ${cellCount}.`);
}

await page.locator('[data-cell-index="2"]').click();
const selectedAfterClick = await page.locator(".board-cell.is-selected").getAttribute("data-cell-index").catch(() => null);
if (selectedAfterClick !== "2") {
  throw new Error(`Horizon tile click did not select the intended cell (selected: ${selectedAfterClick}).`);
}

await page.locator('[data-cell-index="22"]').click();
await page.waitForTimeout(200);
const stillSelected = await page.locator(".board-cell.is-selected").getAttribute("data-cell-index").catch(() => null);
if (stillSelected !== "2") {
  throw new Error("A non-adjacent matching tile should remain selected instead of merging.");
}
if (await page.locator(".tile-level").allTextContents().then((levels) => levels.includes("2"))) {
  throw new Error("Non-adjacent matching tiles must not merge.");
}

await page.locator('[data-cell-index="2"]').click();
await page.locator('[data-cell-index="22"]').click();
const previewed = await page.locator(".board-cell.is-merge-preview").count();
if (previewed < 5) {
  throw new Error(`Expected five adjacent preview tiles, got ${previewed}.`);
}
await page.screenshot({ path: "screens/interaction-selected.png" });
await page.locator('[data-cell-index="23"]').click();
await page.waitForTimeout(350);
const mergedLevels = await page.locator(".tile-level").allTextContents();
if (!mergedLevels.includes("2")) {
  throw new Error(`Expected a level-2 result after a 5-to-2 merge, got: ${mergedLevels.join(",")}`);
}

const source = await page.locator('[data-cell-index="31"]').boundingBox();
const target = await page.locator('[data-cell-index="32"]').boundingBox();
if (!source || !target) throw new Error("Could not resolve drag cells.");
await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
await page.mouse.down();
await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
await page.waitForTimeout(120);
await page.screenshot({ path: "screens/interaction-drag.png" });
await page.mouse.up();
await page.waitForTimeout(250);
const movedLabel = await page.locator('[data-cell-index="32"]').getAttribute("aria-label");
if (!movedLabel?.includes("秋露籽")) {
  throw new Error(`Drag did not move the flower tile: ${movedLabel}`);
}

if (errors.length) {
  throw new Error(`Browser errors: ${errors.join(" | ")}`);
}

await context.close();

const legacyContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: "zh-CN"
});
const legacyBoard = Array.from({ length: 36 }, () => null);
legacyBoard[22] = item("legacy-wood", "wood", 1);
await legacyContext.addInitScript((save) => {
  localStorage.setItem("guiting-shiguang-save-v1", JSON.stringify(save));
}, {
  started: true,
  levelId: 1,
  board: legacyBoard,
  settings: {
    lang: "zh",
    sound: false,
    haptics: false,
    motion: false,
    tutorialDone: true
  }
});
const legacyPage = await legacyContext.newPage();
await legacyPage.goto(process.env.GAME_URL ?? "http://127.0.0.1:4173/", {
  waitUntil: "networkidle"
});
await legacyPage.locator(".cover-enter").click();
await legacyPage.locator(".board-panel").waitFor();
if (await legacyPage.locator(".tile-art").count() !== 1) {
  throw new Error("A legacy 6x6 save was not migrated into the 7x7 board.");
}
await legacyContext.close();

console.log("Horizon verification passed: 7x7 board, legacy-save migration, adjacency guard, 5-to-2 merge, drag-and-drop.");
await browser.close();
