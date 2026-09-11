import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imageDirectory = path.join(process.cwd(), "public", "illustrations");
const files = (await readdir(imageDirectory)).filter((file) => file.endsWith(".png"));

await Promise.all(files.map(async (file) => {
  const source = path.join(imageDirectory, file);
  const destination = path.join(imageDirectory, file.replace(/\.png$/, ".webp"));
  await sharp(source).webp({ quality: 84, effort: 6 }).toFile(destination);
}));

console.log(`Optimized ${files.length} product images.`);
