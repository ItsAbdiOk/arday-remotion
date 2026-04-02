/**
 * Updates README.md with latest post status and A/B test info.
 * Run after auto-post.ts to keep the README current.
 */

import fs from "fs";
import path from "path";

const README_PATH = path.resolve(__dirname, "../README.md");
const LOG_FILE = path.resolve(__dirname, "../out/ab-test-log.json");
const CONFIG_FILE = path.resolve(__dirname, "../src/data/ab-config.ts");
const OPT_LOG_FILE = path.resolve(__dirname, "../out/ab-optimization-log.json");

interface LogEntry {
  date: string;
  wordIndex: number;
  word: string;
  captionStyle: string;
  abTestName: string;
  abVariant: string;
  fbPostId: string;
  igPostId: string;
  fbStoryId: string;
  igStoryId: string;
  fbReelId: string;
  igReelId: string;
}

function main() {
  // Read latest post from log
  let lastPost: LogEntry | null = null;
  let totalPosts = 0;
  if (fs.existsSync(LOG_FILE)) {
    const log: LogEntry[] = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    totalPosts = log.length;
    if (log.length > 0) {
      lastPost = log[log.length - 1];
    }
  }

  // Read active test from config
  const configContent = fs.readFileSync(CONFIG_FILE, "utf-8");
  const testIndexMatch = configContent.match(/testIndex:\s*(\d+)/);
  const startDateMatch = configContent.match(/startDate:\s*"([^"]+)"/);
  const lockedMatch = configContent.match(/lockedWinner:\s*(null|"([^"]*)")/);

  const testIndex = testIndexMatch ? parseInt(testIndexMatch[1]) : 0;
  const startDate = startDateMatch ? startDateMatch[1] : "—";
  const lockedWinner = lockedMatch && lockedMatch[2] ? lockedMatch[2] : null;

  // Parse test names from config
  const testNames: string[] = [];
  const nameMatches = configContent.matchAll(/name:\s*"([^"]+)"/g);
  for (const m of nameMatches) testNames.push(m[1]);

  const currentTestName = testNames[testIndex] || "All tests completed";

  // Read optimization log for completed tests
  let completedTests: string[] = [];
  if (fs.existsSync(OPT_LOG_FILE)) {
    const optLog = JSON.parse(fs.readFileSync(OPT_LOG_FILE, "utf-8"));
    completedTests = optLog.map((e: any) => `${e.testName}: **${e.winner}** won (${e.confidence})`);
  }

  // Count successful posts from last entry
  let lastPostResults = "";
  if (lastPost) {
    const results = [
      lastPost.fbPostId ? "FB Feed" : null,
      lastPost.fbStoryId ? "FB Story" : null,
      lastPost.fbReelId ? "FB Reel" : null,
      lastPost.igPostId ? "IG Feed" : null,
      lastPost.igStoryId ? "IG Story" : null,
      lastPost.igReelId ? "IG Reel" : null,
    ].filter(Boolean);
    lastPostResults = `${results.length}/6 (${results.join(", ")})`;
  }

  // Build status section
  const statusSection = `<!-- STATUS:START -->
## Pipeline Status

| | |
|---|---|
| **Last posted** | ${lastPost ? lastPost.date : "—"} |
| **Last word** | ${lastPost ? `${lastPost.word}` : "—"} |
| **Caption style** | ${lastPost ? `Style ${lastPost.captionStyle}` : "—"} |
| **Posts sent** | ${lastPostResults || "—"} |
| **Total posts to date** | ${totalPosts} |

## A/B Testing

| | |
|---|---|
| **Active test** | ${currentTestName} |
| **Started** | ${startDate} |
| **Status** | ${lockedWinner ? `Winner: ${lockedWinner}` : "Running"} |
| **Tests remaining** | ${Math.max(0, testNames.length - testIndex - 1)} of ${testNames.length} |

### Test Queue
${testNames.map((name, i) => {
  if (i < testIndex) return `- [x] ~~${name}~~`;
  if (i === testIndex) return `- [ ] **${name}** (active)`;
  return `- [ ] ${name}`;
}).join("\n")}

${completedTests.length > 0 ? `### Completed Tests\n${completedTests.map(t => `- ${t}`).join("\n")}` : ""}
<!-- STATUS:END -->`;

  // Read or create README
  let readme = "";
  if (fs.existsSync(README_PATH)) {
    readme = fs.readFileSync(README_PATH, "utf-8");
  }

  // Replace or append status section
  const statusRegex = /<!-- STATUS:START -->[\s\S]*?<!-- STATUS:END -->/;
  if (statusRegex.test(readme)) {
    readme = readme.replace(statusRegex, statusSection);
  } else {
    // Insert after the first heading or at the top
    const firstHeadingEnd = readme.indexOf("\n");
    if (firstHeadingEnd > 0 && readme.startsWith("#")) {
      readme = readme.substring(0, firstHeadingEnd + 1) + "\n" + statusSection + "\n" + readme.substring(firstHeadingEnd + 1);
    } else {
      readme = statusSection + "\n\n" + readme;
    }
  }

  fs.writeFileSync(README_PATH, readme);
  console.log("README.md updated with latest status.");
}

main();
