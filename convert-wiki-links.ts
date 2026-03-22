import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(d =>
    d.isDirectory()
      ? walk(join(dir, d.name))
      : d.name.endsWith(".md")
      ? [join(dir, d.name)]
      : []
  );
}

function convert(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
    let [target, alias] = inner.split("|");

    target = target.trim();
    alias = alias ? alias.trim() : null;

    // Normalize file path
    let file = target.endsWith(".md") ? target : `${target}.md`;

    // Display text
    let text = alias || target.split("/").pop();

    return `[${text}](${file})`;
  });
}

const files = walk(".");

files.forEach(file => {
  const original = readFileSync(file, "utf-8");
  const updated = convert(original);

  if (original !== updated) {
    writeFileSync(file, updated);
    console.log("✔ Converted:", file);
  }
});

console.log("\n✅ All wiki links converted!");