import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const appIconPath = "public/icons/icon-1024.png";
const iconSet = "ios/App/App/Assets.xcassets/AppIcon.appiconset";
const splashSet = "ios/App/App/Assets.xcassets/Splash.imageset";
const iconData = (await readFile(appIconPath)).toString("base64");

await sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 3,
    background: "#e3afb7"
  }
})
  .composite([{ input: await sharp(appIconPath).resize(1024, 1024).png().toBuffer() }])
  .flatten({ background: "#e3afb7" })
  .png()
  .toFile(join(iconSet, "AppIcon-512@2x.png"));

const splashSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
    <defs>
      <radialGradient id="sky" cx=".52" cy=".3" r=".78">
        <stop offset="0" stop-color="#aa96bb"/>
        <stop offset=".48" stop-color="#e5aab2"/>
        <stop offset="1" stop-color="#f7d8b8"/>
      </radialGradient>
      <radialGradient id="moon" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fff0bf" stop-opacity=".38"/>
        <stop offset="1" stop-color="#fff0bf" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#a58fa3"/>
        <stop offset="1" stop-color="#e0b0b2"/>
      </linearGradient>
    </defs>
    <rect width="2732" height="2732" fill="url(#sky)"/>
    <circle cx="2050" cy="710" r="720" fill="url(#moon)"/>
    <circle cx="2050" cy="710" r="180" fill="#fff1c8" opacity=".8"/>
    <circle cx="1366" cy="1226" r="670" fill="none" stroke="#fff1d3" stroke-opacity=".22"/>
    <path d="M0 1890 C 460 1620, 890 1680, 1382 1880 C 1900 2090, 2280 1800, 2732 1470 V 2732 H 0 Z" fill="url(#hills)" opacity=".7"/>
    <path d="M0 2240 C 680 1910, 1290 2370, 2732 1970 V 2732 H 0 Z" fill="#d4a6a8" opacity=".7"/>
    <image href="data:image/png;base64,${iconData}" x="956" y="716" width="820" height="820"/>
    <text x="1366" y="1740" text-anchor="middle" fill="#594257" font-family="KaiTi, SimSun, serif" font-size="154" letter-spacing="24">桂庭拾光</text>
    <line x1="1003" x2="1729" y1="1814" y2="1814" stroke="#a9697c" stroke-opacity=".52" stroke-width="2"/>
    <text x="1366" y="1892" text-anchor="middle" fill="#8f6073" font-family="Georgia, serif" font-size="38" letter-spacing="8">A GARDEN OF LITTLE LIGHTS</text>
  </svg>`;

for (const name of ["splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"]) {
  await sharp(Buffer.from(splashSvg)).png().toFile(join(splashSet, name));
}
