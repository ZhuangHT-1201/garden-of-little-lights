import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const source = "public/assets/osmanthus-icon.svg";
const output = "public/icons";

await mkdir(output, { recursive: true });
await sharp(source).resize(192, 192).png().toFile(`${output}/icon-192.png`);
await sharp(source).resize(512, 512).png().toFile(`${output}/icon-512.png`);
await sharp(source).resize(180, 180).png().toFile(`${output}/apple-touch-icon.png`);
await sharp(source).resize(1024, 1024).png().toFile(`${output}/icon-1024.png`);

const maskableIcon = await sharp(source).resize(410, 410).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#e3afb7"
  }
})
  .composite([{ input: maskableIcon, left: 51, top: 51 }])
  .png()
  .toFile(`${output}/icon-maskable-512.png`);

const androidIcon = await sharp(source).resize(432, 432).png().toBuffer();
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: "#e3afb7"
  }
})
  .composite([{ input: androidIcon, left: 40, top: 40 }])
  .png()
  .toFile(`${output}/android-foreground-512.png`);
