// build-index.mjs
// Reads all .md files in the repo and builds a pagefind/ search index.
// Run with: node build-index.mjs

import { createIndex } from "pagefind";
import { readdir, readFile } from "fs/promises";
import { marked } from "marked";
import path from "path";

// ── Config ────────────────────────────────────────────────
// Folder where your .md files live (relative to this script).
// If your notes are in the repo root, use "./"
// If they're in a subfolder like "wiki-notes/", set that here.
const NOTES_DIR   = "./";
const SITE_PREFIX = "/wiki-notes/";   // must match config.sitePath in index.html
const OUTPUT_DIR  = "./pagefind";
// ─────────────────────────────────────────────────────────

async function getMdFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter(e => e.isFile() && e.name.endsWith(".md"))
    .map(e => path.join(e.parentPath ?? e.path, e.name))
    // exclude node_modules and hidden folders
    .filter(f => !f.includes("node_modules") && !f.includes("/."));
}

async function main() {
  const { index, errors } = await createIndex({});

  if (errors.length) {
    console.error("Pagefind init errors:", errors);
    process.exit(1);
  }

  const files = await getMdFiles(NOTES_DIR);
  console.log(`Found ${files.length} markdown files`);

  for (const file of files) {
    const raw  = await readFile(file, "utf8");
    const html = await marked.parse(raw);

    // Derive the URL path: strip leading "./" and trailing ".md"
    let url = file.replace(/^\.\//, "").replace(/\.md$/, "");
    // README files map to the folder root
    if (url.endsWith("/README") || url === "README") {
      url = url.replace(/\/?README$/, "") || "";
    }
    url = SITE_PREFIX + url;

    // Extract title from first H1 in the markdown
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : file;

    const { errors: addErrors } = await index.addCustomRecord({
      url,
      content: html.replace(/<[^>]+>/g, " "),   // strip HTML tags for clean text
      language: "en",
      meta: { title },
    });

    if (addErrors.length) {
      console.warn(`  ⚠ skipped ${file}:`, addErrors);
    } else {
      console.log(`  ✓ indexed ${url}`);
    }
  }

  const { errors: writeErrors } = await index.writeFiles({ outputPath: OUTPUT_DIR });
  if (writeErrors.length) {
    console.error("Write errors:", writeErrors);
    process.exit(1);
  }

  console.log(`\n✅ Pagefind index written to ${OUTPUT_DIR}/`);
}

main();
