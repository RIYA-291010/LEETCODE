// update_readme.js
// Scans the solutions/ folder, counts solved problems by difficulty,
// and rewrites the stats section of README.md between the markers below.

const fs = require("fs");
const path = require("path");

const SOLUTIONS_DIR = path.join(process.cwd(), "solutions");
const README_PATH = path.join(process.cwd(), "README.md");

const START_MARKER = "<!-- STATS:START -->";
const END_MARKER = "<!-- STATS:END -->";

function getProblemFolders() {
  if (!fs.existsSync(SOLUTIONS_DIR)) return [];
  return fs
    .readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function getDifficulty(folderName) {
  const folderPath = path.join(SOLUTIONS_DIR, folderName);
  const files = fs.readdirSync(folderPath);

  // leetcode-sync (verbose mode) writes a notes/markdown file per problem
  // that includes a line like "Difficulty: Easy/Medium/Hard".
  const noteFile = files.find(
    (f) => f.toLowerCase().endsWith(".md") || f.toLowerCase() === "notes.md"
  );

  if (noteFile) {
    const content = fs.readFileSync(path.join(folderPath, noteFile), "utf8");
    const match = content.match(/Difficulty:\s*(Easy|Medium|Hard)/i);
    if (match) return match[1];
  }

  return "Unknown";
}

function buildStatsSection(counts, total) {
  const acceptance = counts.acceptance || "—";

  return `${START_MARKER}
![Solved](https://img.shields.io/badge/Solved-${total}-brightgreen)
![Easy](https://img.shields.io/badge/Easy-${counts.Easy}-success)
![Medium](https://img.shields.io/badge/Medium-${counts.Medium}-yellow)
![Hard](https://img.shields.io/badge/Hard-${counts.Hard}-red)

| Metric              | Count |
|----------------------|-------|
| ✅ Total Solved       | ${total}     |
| 🟢 Easy               | ${counts.Easy}     |
| 🟡 Medium             | ${counts.Medium}     |
| 🔴 Hard               | ${counts.Hard}     |

*Last updated: ${new Date().toISOString().split("T")[0]}*
${END_MARKER}`;
}

function updateReadme() {
  const folders = getProblemFolders();
  const counts = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };

  folders.forEach((folder) => {
    const difficulty = getDifficulty(folder);
    if (counts[difficulty] !== undefined) counts[difficulty]++;
  });

  const total = folders.length;
  const statsSection = buildStatsSection(counts, total);

  let readme = fs.existsSync(README_PATH)
    ? fs.readFileSync(README_PATH, "utf8")
    : `# 🧩 LeetCode Solutions\n\n${START_MARKER}\n${END_MARKER}\n`;

  const startIdx = readme.indexOf(START_MARKER);
  const endIdx = readme.indexOf(END_MARKER);

  if (startIdx === -1 || endIdx === -1) {
    console.error(
      "Could not find STATS:START / STATS:END markers in README.md. Add them and re-run."
    );
    process.exit(1);
  }

  const before = readme.slice(0, startIdx);
  const after = readme.slice(endIdx + END_MARKER.length);

  const updatedReadme = `${before}${statsSection}${after}`;
  fs.writeFileSync(README_PATH, updatedReadme, "utf8");

  console.log(`README updated: ${total} problems (${JSON.stringify(counts)})`);
}

updateReadme();
