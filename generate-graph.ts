import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";

const notesDir = ".";

// Recursively collect all .md files
function getMarkdownFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  let results: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (entry.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

const files = getMarkdownFiles(notesDir);

type Node = { data: { id: string; label: string } };
type Edge = { data: { source: string; target: string } };

const elements: (Node | Edge)[] = [];
const nodeSet = new Set<string>();

for (const filePath of files) {
  const content = readFileSync(filePath, "utf-8");

  // Use relative path as ID (better for subfolders)
  const noteId = filePath
    .replace(notesDir + "/", "")
    .replace(/\.md$/, "");

  if (!nodeSet.has(noteId)) {
    elements.push({ data: { id: noteId, label: noteId } });
    nodeSet.add(noteId);
  }

  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const target = match[1];

    if (!nodeSet.has(target)) {
      elements.push({ data: { id: target, label: target } });
      nodeSet.add(target);
    }

    elements.push({ data: { source: noteId, target } });
  }
}

writeFileSync("graph.json", JSON.stringify(elements, null, 2));
console.log("✅ graph.json generated (recursive)");