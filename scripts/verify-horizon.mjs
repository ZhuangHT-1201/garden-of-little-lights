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
const board = Array.from({ length: 36 }, () => null);
const item = (id, kind, level) => ({ id, type: "item", kind, level });

[2, 3, 6, 7, 8].forEach((index) => {
  board[index] = item(`wood-${index}`, "wood", 1);
});
board[9] = item("flower-source", "flower", 1);

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

await page.locator('[data-cell-index="2"]').click();
const selectedAfterClick = await page.locator(".board-cell.is-selected").getAttribute("data-cell-index").catch(() => null);
if (selectedAfterClick !== "2") {
  throw new Error(`Horizon tile click did not select the intended cell (selected: ${selectedAfterClick}).`);
}

await page.locator('[data-cell-index="3"]').click();
await page.waitForTimeout(350);
const mergedLevels = await page.locator(".tile-level").allTextContents();
if (!mergedLevels.includes("2")) {
  throw new Error(`Expected a level-2 result after a 5-to-2 merge, got: ${mergedLevels.join(",")}`);
}

const source = await page.locator('[data-cell-index="9"]').boundingBox();
const target = await page.locator('[data-cell-index="10"]').boundingBox();
if (!source || !target) throw new Error("Could not resolve drag cells.");
await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
await page.mouse.down();
await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(250);
const movedLabel = await page.locator('[data-cell-index="10"]').getAttribute("aria-label");
if (!movedLabel?.includes("秋露籽")) {
  throw new Error(`Drag did not move the flower tile: ${movedLabel}`);
}

if (errors.length) {
  throw new Error(`Browser errors: ${errors.join(" | ")}`);
}

console.log("Horizon interaction verification passed: select, 5-to-2 merge, drag-and-drop.");
await context.close();
await browser.close();
