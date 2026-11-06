import { readFileSync, writeFileSync } from "node:fs";

const file = "dist/manifest.webmanifest";
const manifest = JSON.parse(readFileSync(file, "utf8"));

manifest.id = "./";
manifest.screenshots = [
  {
    src: "screenshots/cover.png",
    sizes: "1170x2532",
    type: "image/png",
    form_factor: "narrow",
    label: "桂庭拾光 · 小院封面"
  },
  {
    src: "screenshots/game.png",
    sizes: "1170x2532",
    type: "image/png",
    form_factor: "narrow",
    label: "桂庭拾光 · 立体棋盘"
  }
];

writeFileSync(file, JSON.stringify(manifest));
