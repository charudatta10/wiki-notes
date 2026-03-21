// build-index.mjs
// Run with: bun build-index.mjs

import { createIndex } from "pagefind";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { parse } from "marked"; // ✅ fixed import

// ── Config ────────────────────────────────────────────────
const NOTES_DIR   = "./";               // where .md files live
const SITE_PREFIX = "/wiki-notes/";     // must match your frontend
const OUTPUT_DIR  = "./pagefind";
// ─────────────────────────────────────────────────────────

// ✅ Safe recursive directory walk (works in Bun + Windows)
async function getMdFiles(dir) {
  let results = [];

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // skip unwanted dirs
    if (
      fullPath.includes("node_modules") ||
      fullPath.includes(".git") ||
      entry.name.startsWith(".")
    ) continue;

    if (entry.isDirectory()) {
      const subFiles = await getMdFiles(fullPath);
      results = results.concat(subFiles);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

async function main() {
  const { index, errors } = await createIndex({});

  if (errors.length) {
    console.error("❌ Pagefind init errors:", errors);
    process.exit(1);
  }

  const files = await getMdFiles(NOTES_DIR);
  console.log(`📄 Found ${files.length} markdown files\n`);

  for (const file of files) {
    try {
      const raw = await readFile(file, "utf8");

      // ✅ Convert markdown → HTML → clean text
      const html = await parse(raw);
      const cleanText = html.replace(/<[^>]+>/g, " ");

      // ✅ URL handling (cross-platform)
      let url = file.replace(/\\/g, "/");     // Windows fix
      url = url.replace(/^\.\//, "").replace(/\.md$/, "");

      // README → folder root
      if (url.endsWith("/README") || url === "README") {
        url = url.replace(/\/?README$/, "") || "";
      }

      url = SITE_PREFIX + url;

      // ✅ Extract title (first H1)
      const titleMatch = raw.match(/^#\s+(.+)$/m);
      const title = titleMatch
        ? titleMatch[1].trim()
        : path.basename(file, ".md");

      const { errors: addErrors } = await index.addCustomRecord({
        url,
        content: cleanText,
        language: "en",
        meta: { title },
      });

      if (addErrors.length) {
        console.warn(`⚠️ Skipped ${file}`, addErrors);
      } else {
        console.log(`✓ Indexed: ${url}`);
      }

    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  const { errors: writeErrors } = await index.writeFiles({
    outputPath: OUTPUT_DIR,
  });

  if (writeErrors.length) {
    console.error("❌ Write errors:", writeErrors);
    process.exit(1);
  }

  console.log(`\n✅ Pagefind index written to: ${OUTPUT_DIR}/`);
}

main();