// update_readme.js
// Scans the solutions/ folder, looks up each problem's difficulty directly
// from LeetCode's public API (cached locally so we don't re-fetch every run),
// and rewrites the stats section of README.md between the markers below.

const fs = require("fs");
const path = require("path");

const SOLUTIONS_DIR = path.join(process.cwd(), "solutions");
const README_PATH = path.join(process.cwd(), "README.md");
const CACHE_PATH = path.join(process.cwd(), "difficulty-cache.json");

const START_MARKER = "<!-- STATS:START -->";
const END_MARKER = "<!-- STATS:END -->";

function getProblemFolders() {
  if (!fs.existsSync(SOLUTIONS_DIR)) return [];
  return fs
    .readdirSync(SOLUTIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

// "0001-two-sum" -> "two-sum"
function folderToSlug(folderName) {
  return folderName.replace(/^\d+[-_]?/, "");
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

async function fetchDifficulty(slug) {
  const query = {
    query: `query getDifficulty($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        difficulty
      }
    }`,
    variables: { titleSlug: slug },
  };

  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    const data = await res.json();
    return data?.data?.question?.difficulty || "Unknown";
  } catch (err) {
    console.error(`Failed to fetch difficulty for ${slug}:`, err.message);
    return "Unknown";
  }
}

function buildStatsSection(counts, total) {
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

async function updateReadme() {
  const folders = getProblemFolders();
  const cache = loadCache();
  const counts = { Easy: 0, Medium: 0, Hard: 0, Unknown: 0 };

  for (const folder of folders) {
    const slug = folderToSlug(folder);

    if (!cache[slug]) {
      console.log(`Fetching difficulty for: ${slug}`);
      cache[slug] = await fetchDifficulty(slug);
    }

    const difficulty = cache[slug];
    if (counts[difficulty] !== undefined) {
      counts[difficulty]++;
    } else {
      counts.Unknown++;
    }
  }

  saveCache(cache);

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
