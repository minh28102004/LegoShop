const fs = require("fs");
const path = require("path");

const backendSrc = path.join(process.cwd(), "apps", "backend", "src");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return walk(fullPath);
    }

    if (entry.isFile() && entry.name.endsWith(".module.ts")) {
      return [fullPath];
    }

    return [];
  });
}

function uniqueLines(lines) {
  const seen = new Set();
  const result = [];

  for (const line of lines) {
    const key = line.trim();

    if (!key) {
      result.push(line);
      continue;
    }

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(line);
  }

  return result;
}

function dedupeArrayByName(content, propertyName) {
  const regex = new RegExp(`${propertyName}:\\s*\\[([\\s\\S]*?)\\]`, "m");

  return content.replace(regex, (match, body) => {
    const items = body
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const seen = new Set();
    const uniqueItems = [];

    for (const item of items) {
      if (seen.has(item)) continue;
      seen.add(item);
      uniqueItems.push(item);
    }

    if (uniqueItems.length === 0) {
      return `${propertyName}: []`;
    }

    return `${propertyName}: [${uniqueItems.join(", ")}]`;
  });
}

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let content = original;

  const lines = content.split(/\r?\n/);
  const fixedLines = uniqueLines(lines);
  content = fixedLines.join("\n");

  for (const propertyName of ["imports", "controllers", "providers", "exports"]) {
    content = dedupeArrayByName(content, propertyName);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`fixed ${path.relative(process.cwd(), filePath)}`);
  }
}

if (!fs.existsSync(backendSrc)) {
  console.error(`Cannot find backend src folder: ${backendSrc}`);
  process.exit(1);
}

const files = walk(backendSrc);

for (const file of files) {
  fixFile(file);
}

console.log(`Checked ${files.length} module files.`);