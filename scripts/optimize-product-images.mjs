import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imageDirectory = path.join(process.cwd(), "public", "illustrations");
const files = (await readdir(imageDirectory)).filter((file) => file.endsWith(".png"));

await Promise.all(files.map(async (file) => {
  const source = path.join(imageDirectory, file);
  const destination = path.join(imageDirectory, file.replace(/\.png$/, ".webp"));
  await sharp(source).webp({ quality: 84, effort: 6 }).toFile(destination);
  await Promise.all([320, 640, 768, 960].map((width) => sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(imageDirectory, file.replace(/\.png$/, `-${width}.webp`)))));
}));

console.log(`Optimized ${files.length} product images.`);
