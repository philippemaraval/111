import { readFile, writeFile } from "node:fs/promises";

const PATCHES = [
  {
    file: ".open-next/cloudflare/init.js",
    before: 'globalThis.__dirname ??= "";',
    after: 'globalThis.__dirname ??= "/bundle";'
  },
  {
    file: ".open-next/cloudflare/init.js",
    before: 'globalThis.__filename ??= "";',
    after: 'globalThis.__filename ??= "/bundle/worker.js";'
  },
  {
    file: ".open-next/cloudflare-templates/init.js",
    before: 'globalThis.__dirname ??= "";',
    after: 'globalThis.__dirname ??= "/bundle";'
  },
  {
    file: ".open-next/cloudflare-templates/init.js",
    before: 'globalThis.__filename ??= "";',
    after: 'globalThis.__filename ??= "/bundle/worker.js";'
  }
];

async function patchFile(file, replacements) {
  let content = await readFile(file, "utf8");

  for (const replacement of replacements) {
    if (!content.includes(replacement.before)) {
      throw new Error(`Patch target not found in ${file}: ${replacement.before}`);
    }

    content = content.replace(replacement.before, replacement.after);
  }

  await writeFile(file, content);
}

async function main() {
  const files = [...new Set(PATCHES.map((item) => item.file))];

  for (const file of files) {
    await patchFile(
      file,
      PATCHES.filter((item) => item.file === file)
    );
  }

  console.log("Patched OpenNext Cloudflare runtime for /bundle __dirname.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
