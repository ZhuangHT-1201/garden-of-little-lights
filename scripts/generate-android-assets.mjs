import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const res = "android/app/src/main/res";
const appIcon = "public/icons/icon-1024.png";

const launcherSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

const foregroundSizes = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432
};

for (const [density, size] of Object.entries(launcherSizes)) {
  const dir = join(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });
  await sharp(appIcon).resize(size, size).png().toFile(join(dir, "ic_launcher.png"));
  await sharp(appIcon).resize(size, size).png().toFile(join(dir, "ic_launcher_round.png"));
}

for (const [density, size] of Object.entries(foregroundSizes)) {
  const dir = join(res, `mipmap-${density}`);
  await mkdir(dir, { recursive: true });
  await sharp("public/icons/android-foreground-512.png").resize(size, size).png().toFile(join(dir, "ic_launcher_foreground.png"));
}

const splashSizes = {
  mdpi: [320, 480],
  hdpi: [480, 720],
  xhdpi: [640, 960],
  xxhdpi: [960, 1440],
  xxxhdpi: [1280, 1920]
};

function splashSvg(width, height, portrait) {
  const iconSize = Math.round(Math.min(width, height) * (portrait ? 0.34 : 0.27));
  const iconX = portrait ? (width - iconSize) / 2 : width * 0.19 - iconSize / 2;
  const iconY = portrait ? height * 0.34 - iconSize / 2 : (height - iconSize) / 2;
  const titleY = portrait ? Math.round(height * 0.64) : Math.round(height * 0.51);
  const subtitleY = titleY + Math.max(24, Math.round(height * 0.045));
  const titleSize = Math.max(26, Math.round(Math.min(width, height) * 0.065));
  const subSize = Math.max(8, Math.round(titleSize * 0.23));
  const underlineY = titleY + Math.max(12, Math.round(titleSize * 0.42));
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="sky" cx="${portrait ? 0.52 : 0.38}" cy="${portrait ? 0.28 : 0.42}" r=".75">
          <stop offset="0" stop-color="#ad99bd"/>
          <stop offset=".52" stop-color="#e4a9b1"/>
          <stop offset="1" stop-color="#f7d7b7"/>
        </radialGradient>
        <radialGradient id="moon" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#fff0bf" stop-opacity=".4"/>
          <stop offset="1" stop-color="#fff0bf" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="hills" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9d899f"/>
          <stop offset="1" stop-color="#e3b3b5"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#sky)"/>
      <circle cx="${width * 0.76}" cy="${height * 0.22}" r="${width * 0.32}" fill="url(#moon)"/>
      <circle cx="${width * 0.76}" cy="${height * 0.22}" r="${Math.min(width, height) * 0.075}" fill="#fff0c4" opacity=".78"/>
      <path d="M0 ${height * 0.7} C ${width * 0.19} ${height * 0.56}, ${width * 0.33} ${height * 0.6}, ${width * 0.51} ${height * 0.68} C ${width * 0.68} ${height * 0.76}, ${width * 0.84} ${height * 0.65}, ${width} ${height * 0.53} V ${height} H 0 Z" fill="url(#hills)" opacity=".72"/>
      <path d="M0 ${height * 0.82} C ${width * 0.25} ${height * 0.69}, ${width * 0.54} ${height * 0.89}, ${width} ${height * 0.72} V ${height} H 0 Z" fill="#d8aaa9" opacity=".62"/>
      <circle cx="${width * 0.5}" cy="${height * 0.5}" r="${Math.min(width, height) * 0.23}" fill="none" stroke="#fff1d5" stroke-opacity=".28"/>
      <image href="data:image/png;base64,__ICON__" x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}"/>
      <text x="${portrait ? width * 0.5 : width * 0.37}" y="${titleY}" text-anchor="${portrait ? "middle" : "start"}" fill="#5b4459" font-family="KaiTi, SimSun, serif" font-size="${titleSize}" letter-spacing="${titleSize * 0.16}">桂庭拾光</text>
      <line x1="${portrait ? width * 0.37 : width * 0.37}" x2="${portrait ? width * 0.63 : width * 0.64}" y1="${underlineY}" y2="${underlineY}" stroke="#a9677c" stroke-opacity=".55"/>
      <text x="${portrait ? width * 0.5 : width * 0.37}" y="${subtitleY}" text-anchor="${portrait ? "middle" : "start"}" fill="#8e6173" font-family="Georgia, serif" font-size="${subSize}" letter-spacing="${subSize * 0.24}">A GARDEN OF LITTLE LIGHTS</text>
    </svg>`;
}

const iconData = (await readFile(appIcon)).toString("base64");

for (const [density, [width, height]] of Object.entries(splashSizes)) {
  for (const [kind, portrait, dimensions] of [
    ["port", true, [height, width]],
    ["land", false, [width, height]]
  ]) {
    const [w, h] = dimensions;
    const dir = join(res, `drawable-${kind}-${density}`);
    await mkdir(dir, { recursive: true });
    const svg = splashSvg(w, h, portrait).replace("__ICON__", iconData);
    await sharp(Buffer.from(svg)).png().toFile(join(dir, "splash.png"));
  }
}

await sharp(Buffer.from(splashSvg(480, 800, true).replace("__ICON__", iconData)))
  .png()
  .toFile(join(res, "drawable", "splash.png"));

await writeFile(
  join(res, "values", "colors.xml"),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="colorPrimary">#CF8796</color>\n    <color name="colorPrimaryDark">#A96980</color>\n    <color name="colorAccent">#E9C48A</color>\n    <color name="colorSystemBar">#F6E7DD</color>\n</resources>\n`,
  "utf8"
);
