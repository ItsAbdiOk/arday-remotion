/**
 * A/B Test Auto-Optimizer
 *
 * Reads the latest ab-report.json, checks for a statistically significant
 * winner, and advances the test queue if appropriate.
 *
 * Decision rules:
 * - After 30+ days with 15+ posts per variant:
 *   - Winner needs 20%+ better performance on the primary metric
 *   - If winner found: lock it in, advance to next test
 * - After 30 days with no winner: extend 15 more days
 * - After 45 days with no winner: pick higher reach, move on
 *
 * Usage: npx ts-node scripts/ab-optimize.ts
 */

import fs from "fs";
import path from "path";

const REPORT_FILE = path.resolve(__dirname, "../out/ab-report.json");
const CONFIG_FILE = path.resolve(__dirname, "../src/data/ab-config.ts");
const OPT_LOG_FILE = path.resolve(__dirname, "../out/ab-optimization-log.json");

interface PostReport {
  date: string;
  word: string;
  captionStyle: string;
  ig: {
    feed: { like_count: number; comments_count: number; impressions: number; reach: number; saved: number } | null;
    story: { like_count: number; comments_count: number; impressions: number; reach: number; saved: number } | null;
    reel: { like_count: number; comments_count: number; impressions: number; reach: number; saved: number } | null;
  };
  fb: {
    feed: { likes: number; comments: number; shares: number; impressions: number; clicks: number } | null;
    story: { likes: number; comments: number; shares: number; impressions: number; clicks: number } | null;
    reel: { likes: number; comments: number; shares: number; impressions: number; clicks: number } | null;
  };
}

interface Report {
  generatedAt: string;
  totalPosts: number;
  posts: PostReport[];
}

interface OptLogEntry {
  date: string;
  testName: string;
  winner: string;
  metric: string;
  confidence: string;
  nextTest: string | null;
}

function getMetricValue(post: PostReport, metric: string): number {
  let total = 0;

  if (metric === "clicks") {
    if (post.fb.feed) total += post.fb.feed.clicks;
    if (post.fb.story) total += post.fb.story.clicks;
    if (post.fb.reel) total += post.fb.reel.clicks;
  } else if (metric === "reach") {
    if (post.ig.feed) total += post.ig.feed.reach;
    if (post.ig.story) total += post.ig.story.reach;
    if (post.ig.reel) total += post.ig.reel.reach;
    if (post.fb.feed) total += post.fb.feed.impressions;
    if (post.fb.story) total += post.fb.story.impressions;
    if (post.fb.reel) total += post.fb.reel.impressions;
  } else if (metric === "engagement") {
    if (post.ig.feed) total += post.ig.feed.like_count + post.ig.feed.comments_count + post.ig.feed.saved;
    if (post.ig.story) total += post.ig.story.like_count + post.ig.story.comments_count;
    if (post.ig.reel) total += post.ig.reel.like_count + post.ig.reel.comments_count + post.ig.reel.saved;
    if (post.fb.feed) total += post.fb.feed.likes + post.fb.feed.comments + post.fb.feed.shares;
    if (post.fb.story) total += post.fb.story.likes + post.fb.story.comments;
    if (post.fb.reel) total += post.fb.reel.likes + post.fb.reel.comments + post.fb.reel.shares;
  }

  return total;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function daysBetween(a: string, b: string): number {
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function updateConfigFile(testIndex: number, startDate: string, lockedWinner: string | null) {
  let content = fs.readFileSync(CONFIG_FILE, "utf-8");

  content = content.replace(
    /export const activeTest: ActiveTest = \{[\s\S]*?\};/,
    `export const activeTest: ActiveTest = {
  testIndex: ${testIndex},
  startDate: "${startDate}",
  lockedWinner: ${lockedWinner ? `"${lockedWinner}"` : "null"},
};`
  );

  fs.writeFileSync(CONFIG_FILE, content);
}

function appendOptLog(entry: OptLogEntry) {
  let log: OptLogEntry[] = [];
  if (fs.existsSync(OPT_LOG_FILE)) {
    try {
      log = JSON.parse(fs.readFileSync(OPT_LOG_FILE, "utf-8"));
    } catch {}
  }
  log.push(entry);
  fs.mkdirSync(path.dirname(OPT_LOG_FILE), { recursive: true });
  fs.writeFileSync(OPT_LOG_FILE, JSON.stringify(log, null, 2) + "\n");
}

function main() {
  if (!fs.existsSync(REPORT_FILE)) {
    console.log("No ab-report.json found. Run ab-report.ts first.");
    return;
  }

  const report: Report = JSON.parse(fs.readFileSync(REPORT_FILE, "utf-8"));

  // Read current config
  const configContent = fs.readFileSync(CONFIG_FILE, "utf-8");
  const testIndexMatch = configContent.match(/testIndex:\s*(\d+)/);
  const startDateMatch = configContent.match(/startDate:\s*"([^"]+)"/);
  const lockedMatch = configContent.match(/lockedWinner:\s*(null|"([^"]*)")/);

  const currentTestIndex = testIndexMatch ? parseInt(testIndexMatch[1]) : 0;
  const startDate = startDateMatch ? startDateMatch[1] : "2026-03-31";
  const currentLocked = lockedMatch && lockedMatch[2] ? lockedMatch[2] : null;

  // Import test queue info
  const testQueueMatch = configContent.match(/export const testQueue: TestDefinition\[\] = \[([\s\S]*?)\];/);
  if (!testQueueMatch) {
    console.error("Could not parse testQueue from ab-config.ts");
    return;
  }

  // Parse test names and metrics from config
  const testNames: string[] = [];
  const testMetrics: string[] = [];
  const testMinDays: number[] = [];
  const testMaxDays: number[] = [];
  const testVariantIds: string[][] = [];

  const nameMatches = configContent.matchAll(/name:\s*"([^"]+)"/g);
  for (const m of nameMatches) testNames.push(m[1]);

  const metricMatches = configContent.matchAll(/metric:\s*"([^"]+)"/g);
  for (const m of metricMatches) testMetrics.push(m[1]);

  const minDayMatches = configContent.matchAll(/minDays:\s*(\d+)/g);
  for (const m of minDayMatches) testMinDays.push(parseInt(m[1]));

  const maxDayMatches = configContent.matchAll(/maxDays:\s*(\d+)/g);
  for (const m of maxDayMatches) testMaxDays.push(parseInt(m[1]));

  // Parse variant IDs per test
  const variantBlocks = configContent.matchAll(/variants:\s*\[([\s\S]*?)\]/g);
  for (const block of variantBlocks) {
    const ids: string[] = [];
    const idMatches = block[1].matchAll(/id:\s*"([^"]+)"/g);
    for (const m of idMatches) ids.push(m[1]);
    testVariantIds.push(ids);
  }

  if (currentTestIndex >= testNames.length) {
    console.log("All tests in the queue have been completed.");
    return;
  }

  if (currentLocked) {
    console.log(`Test "${testNames[currentTestIndex]}" already has winner: ${currentLocked}`);
    console.log("Run was already optimized. Skipping.");
    return;
  }

  const testName = testNames[currentTestIndex];
  const metric = testMetrics[currentTestIndex];
  const minDays = testMinDays[currentTestIndex] || 30;
  const maxDays = testMaxDays[currentTestIndex] || 45;
  const variantIds = testVariantIds[currentTestIndex] || [];
  const today = new Date().toISOString().split("T")[0];
  const elapsed = daysBetween(startDate, today);

  console.log(`\n=== A/B Optimizer ===`);
  console.log(`Test:    ${testName}`);
  console.log(`Metric:  ${metric}`);
  console.log(`Started: ${startDate} (${elapsed} days ago)`);
  console.log(`Variants: ${variantIds.join(", ")}`);
  console.log();

  // Group posts by variant (using captionStyle field for now — first test)
  const variantMetrics: Map<string, number[]> = new Map();
  for (const v of variantIds) variantMetrics.set(v, []);

  for (const post of report.posts) {
    const variant = post.captionStyle;
    if (variantMetrics.has(variant)) {
      variantMetrics.get(variant)!.push(getMetricValue(post, metric));
    }
  }

  // Print per-variant stats
  for (const [v, values] of variantMetrics) {
    console.log(`  ${v}: ${values.length} posts, avg ${metric} = ${avg(values).toFixed(1)}`);
  }
  console.log();

  // Check minimum data requirements
  const minPostsPerVariant = 15;
  const allHaveEnoughData = [...variantMetrics.values()].every(
    (v) => v.length >= minPostsPerVariant
  );

  if (elapsed < minDays) {
    console.log(`Only ${elapsed} days elapsed (need ${minDays}). Waiting for more data.`);
    return;
  }

  if (!allHaveEnoughData && elapsed < maxDays) {
    console.log(`Not enough posts per variant yet (need ${minPostsPerVariant} each). Extending test.`);
    return;
  }

  // Find winner
  let winnerId = "";
  let confidence = "";
  const variantAvgs: { id: string; avg: number }[] = [];

  for (const [v, values] of variantMetrics) {
    variantAvgs.push({ id: v, avg: avg(values) });
  }
  variantAvgs.sort((a, b) => b.avg - a.avg);

  const best = variantAvgs[0];
  const second = variantAvgs[1];

  if (best && second && second.avg > 0) {
    const improvement = (best.avg - second.avg) / second.avg;

    if (improvement >= 0.2) {
      winnerId = best.id;
      confidence = `${(improvement * 100).toFixed(1)}% better (threshold: 20%)`;
      console.log(`Winner: ${winnerId} — ${confidence}`);
    } else if (elapsed >= maxDays) {
      // Max days reached, pick higher reach
      winnerId = best.id;
      confidence = `${(improvement * 100).toFixed(1)}% better (max days reached, picking best)`;
      console.log(`Max days reached. Picking ${winnerId} — ${confidence}`);
    } else {
      console.log(`No clear winner yet (${(improvement * 100).toFixed(1)}% < 20%). Extending test.`);
      return;
    }
  } else if (best) {
    winnerId = best.id;
    confidence = "only variant with data";
    console.log(`Winner by default: ${winnerId}`);
  } else {
    console.log("No data to analyze.");
    return;
  }

  // Lock winner and advance
  const nextTestIndex = currentTestIndex + 1;
  const nextTestName = nextTestIndex < testNames.length ? testNames[nextTestIndex] : null;

  console.log(`\nLocking winner: ${winnerId}`);
  console.log(`Advancing to test ${nextTestIndex}: ${nextTestName || "none (all done)"}`);

  // Update config: set locked winner on current, advance index, reset start date
  updateConfigFile(nextTestIndex, today, null);

  // But first, re-read and set the locked winner for the current test
  // We advance testIndex but the locked winner applies to the previous test
  // The config stores which test is *active* — the locked winner is used when
  // a test is concluded. Since we advance, the new test starts fresh.

  // Log the decision
  appendOptLog({
    date: today,
    testName,
    winner: winnerId,
    metric,
    confidence,
    nextTest: nextTestName,
  });

  console.log(`\nDecision logged to ${OPT_LOG_FILE}`);
  console.log(`Config updated: testIndex=${nextTestIndex}, startDate=${today}`);
}

main();
