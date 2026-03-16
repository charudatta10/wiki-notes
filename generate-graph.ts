import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const notesDir = "."; // adjust to your notes folder

// Collect all markdown files
const files = readdirSync(notesDir).filter(f => f.endsWith(".md"));

type Node = { data: { id: string; label: string } };
type Edge = { data: { source: string; target: string } };

const elements: (Node | Edge)[] = [];

// Track nodes to avoid duplicates
const nodeSet = new Set<string>();

for (const file of files) {
  const filePath = join(notesDir, file);
  const content = readFileSync(filePath, "utf-8");
  const noteId = file.replace(".md", "");

  // Add node if not already present
  if (!nodeSet.has(noteId)) {
    elements.push({ data: { id: noteId, label: noteId } });
    nodeSet.add(noteId);
  }

  // Find wikilinks [[...]]
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const target = match[1];

    // Add placeholder node if missing
    if (!nodeSet.has(target)) {
      elements.push({ data: { id: target, label: target } });
      nodeSet.add(target);
    }

    // Add edge
    elements.push({ data: { source: noteId, target } });
  }
}

// Write graph.json
writeFileSync("graph.json", JSON.stringify(elements, null, 2));
console.log("✅ graph.json generated with placeholder nodes");