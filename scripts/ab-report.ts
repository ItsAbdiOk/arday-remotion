/**
 * A/B Test Report Generator
 *
 * Reads out/ab-test-log.json, fetches engagement metrics from Meta Graph API
 * for each post, groups by caption style, and outputs a summary.
 *
 * Usage: npx ts-node scripts/ab-report.ts
 */

import fs from "fs";
import path from "path";

const LOG_FILE = path.resolve(__dirname, "../out/ab-test-log.json");
const REPORT_FILE = path.resolve(__dirname, "../out/ab-report.json");
const GRAPH_API = "https://graph.facebook.com/v21.0";

interface LogEntry {
  date: string;
  wordIndex: number;
  word: string;
  captionStyle: "A" | "B";
  fbPostId: string;
  igPostId: string;
  fbStoryId: string;
  igStoryId: string;
  fbReelId: string;
  igReelId: string;
}

interface IGMetrics {
  like_count: number;
  comments_count: number;
  impressions: number;
  reach: number;
  saved: number;
}

interface FBMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
}

interface PostReport {
  date: string;
  word: string;
  captionStyle: "A" | "B";
  ig: {
    feed: IGMetrics | null;
    story: IGMetrics | null;
    reel: IGMetrics | null;
  };
  fb: {
    feed: FBMetrics | null;
    story: FBMetrics | null;
    reel: FBMetrics | null;
  };
}

interface StyleSummary {
  style: "A" | "B";
  postCount: number;
  ig: {
    avgLikes: number;
    avgComments: number;
    avgImpressions: number;
    avgReach: number;
    avgSaved: number;
    totalEngagement: number;
  };
  fb: {
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    avgImpressions: number;
    avgClicks: number;
    totalEngagement: number;
  };
}

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
  return val;
}

async function fetchIGMetrics(postId: string, token: string): Promise<IGMetrics | null> {
  if (!postId) return null;
  try {
    const res = await fetch(
      `${GRAPH_API}/${postId}?fields=like_count,comments_count,impressions,reach,saved&access_token=${token}`
    );
    const data = await res.json();
    if (!res.ok) {
      console.error(`  IG ${postId}: ${data.error?.message || "error"}`);
      return null;
    }
    return {
      like_count: data.like_count || 0,
      comments_count: data.comments_count || 0,
      impressions: data.impressions || 0,
      reach: data.reach || 0,
      saved: data.saved || 0,
    };
  } catch (e) {
    console.error(`  IG ${postId}: fetch failed`);
    return null;
  }
}

async function fetchFBMetrics(postId: string, token: string): Promise<FBMetrics | null> {
  if (!postId) return null;
  try {
    const res = await fetch(
      `${GRAPH_API}/${postId}?fields=likes.summary(true),comments.summary(true),shares,insights.metric(post_impressions,post_clicks)&access_token=${token}`
    );
    const data = await res.json();
    if (!res.ok) {
      console.error(`  FB ${postId}: ${data.error?.message || "error"}`);
      return null;
    }

    let impressions = 0;
    let clicks = 0;
    if (data.insights?.data) {
      for (const metric of data.insights.data) {
        if (metric.name === "post_impressions") {
          impressions = metric.values?.[0]?.value || 0;
        }
        if (metric.name === "post_clicks") {
          clicks = metric.values?.[0]?.value || 0;
        }
      }
    }

    return {
      likes: data.likes?.summary?.total_count || 0,
      comments: data.comments?.summary?.total_count || 0,
      shares: data.shares?.count || 0,
      impressions,
      clicks,
    };
  } catch (e) {
    console.error(`  FB ${postId}: fetch failed`);
    return null;
  }
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function summarizeStyle(posts: PostReport[], style: "A" | "B"): StyleSummary {
  const filtered = posts.filter((p) => p.captionStyle === style);

  const igLikes: number[] = [];
  const igComments: number[] = [];
  const igImpressions: number[] = [];
  const igReach: number[] = [];
  const igSaved: number[] = [];
  const fbLikes: number[] = [];
  const fbComments: number[] = [];
  const fbShares: number[] = [];
  const fbImpressions: number[] = [];
  const fbClicks: number[] = [];

  for (const p of filtered) {
    for (const m of [p.ig.feed, p.ig.story, p.ig.reel]) {
      if (m) {
        igLikes.push(m.like_count);
        igComments.push(m.comments_count);
        igImpressions.push(m.impressions);
        igReach.push(m.reach);
        igSaved.push(m.saved);
      }
    }
    for (const m of [p.fb.feed, p.fb.story, p.fb.reel]) {
      if (m) {
        fbLikes.push(m.likes);
        fbComments.push(m.comments);
        fbShares.push(m.shares);
        fbImpressions.push(m.impressions);
        fbClicks.push(m.clicks);
      }
    }
  }

  return {
    style,
    postCount: filtered.length,
    ig: {
      avgLikes: avg(igLikes),
      avgComments: avg(igComments),
      avgImpressions: avg(igImpressions),
      avgReach: avg(igReach),
      avgSaved: avg(igSaved),
      totalEngagement: igLikes.reduce((a, b) => a + b, 0) +
        igComments.reduce((a, b) => a + b, 0) +
        igSaved.reduce((a, b) => a + b, 0),
    },
    fb: {
      avgLikes: avg(fbLikes),
      avgComments: avg(fbComments),
      avgShares: avg(fbShares),
      avgImpressions: avg(fbImpressions),
      avgClicks: avg(fbClicks),
      totalEngagement: fbLikes.reduce((a, b) => a + b, 0) +
        fbComments.reduce((a, b) => a + b, 0) +
        fbShares.reduce((a, b) => a + b, 0),
    },
  };
}

async function main() {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {}

  const token = requireEnv("META_PAGE_ACCESS_TOKEN");

  if (!fs.existsSync(LOG_FILE)) {
    console.log(`No log file found at ${LOG_FILE}`);
    console.log("Not enough data yet — run auto-post.ts first to generate post data.");
    console.log("Exiting gracefully.");
    return;
  }

  const log: LogEntry[] = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));

  if (log.length === 0) {
    console.log("Log file is empty — not enough data yet.");
    console.log("Exiting gracefully.");
    return;
  }

  console.log(`\nLoaded ${log.length} post entries from log.\n`);

  const reports: PostReport[] = [];

  for (const entry of log) {
    console.log(`Fetching metrics for ${entry.date} — ${entry.word} (Style ${entry.captionStyle})`);

    const igFeed = await fetchIGMetrics(entry.igPostId, token);
    const igStory = await fetchIGMetrics(entry.igStoryId, token);
    const igReel = await fetchIGMetrics(entry.igReelId, token);
    const fbFeed = await fetchFBMetrics(entry.fbPostId, token);
    const fbStory = await fetchFBMetrics(entry.fbStoryId, token);
    const fbReel = await fetchFBMetrics(entry.fbReelId, token);

    reports.push({
      date: entry.date,
      word: entry.word,
      captionStyle: entry.captionStyle,
      ig: { feed: igFeed, story: igStory, reel: igReel },
      fb: { feed: fbFeed, story: fbStory, reel: fbReel },
    });
  }

  const summaryA = summarizeStyle(reports, "A");
  const summaryB = summarizeStyle(reports, "B");

  const fullReport = {
    generatedAt: new Date().toISOString(),
    totalPosts: log.length,
    summaryA,
    summaryB,
    posts: reports,
  };

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(fullReport, null, 2) + "\n");
  console.log(`\nReport saved to ${REPORT_FILE}\n`);

  // Print summary table
  console.log("=== A/B Test Summary ===\n");
  console.log(`Style A posts: ${summaryA.postCount}`);
  console.log(`Style B posts: ${summaryB.postCount}\n`);

  console.log("Instagram:");
  console.log("                    Style A    Style B    Winner");
  console.log(`  Avg Likes        ${String(summaryA.ig.avgLikes).padStart(8)}   ${String(summaryB.ig.avgLikes).padStart(8)}    ${summaryA.ig.avgLikes > summaryB.ig.avgLikes ? "A" : summaryB.ig.avgLikes > summaryA.ig.avgLikes ? "B" : "-"}`);
  console.log(`  Avg Comments     ${String(summaryA.ig.avgComments).padStart(8)}   ${String(summaryB.ig.avgComments).padStart(8)}    ${summaryA.ig.avgComments > summaryB.ig.avgComments ? "A" : summaryB.ig.avgComments > summaryA.ig.avgComments ? "B" : "-"}`);
  console.log(`  Avg Impressions  ${String(summaryA.ig.avgImpressions).padStart(8)}   ${String(summaryB.ig.avgImpressions).padStart(8)}    ${summaryA.ig.avgImpressions > summaryB.ig.avgImpressions ? "A" : summaryB.ig.avgImpressions > summaryA.ig.avgImpressions ? "B" : "-"}`);
  console.log(`  Avg Reach        ${String(summaryA.ig.avgReach).padStart(8)}   ${String(summaryB.ig.avgReach).padStart(8)}    ${summaryA.ig.avgReach > summaryB.ig.avgReach ? "A" : summaryB.ig.avgReach > summaryA.ig.avgReach ? "B" : "-"}`);
  console.log(`  Avg Saved        ${String(summaryA.ig.avgSaved).padStart(8)}   ${String(summaryB.ig.avgSaved).padStart(8)}    ${summaryA.ig.avgSaved > summaryB.ig.avgSaved ? "A" : summaryB.ig.avgSaved > summaryA.ig.avgSaved ? "B" : "-"}`);

  console.log("\nFacebook:");
  console.log("                    Style A    Style B    Winner");
  console.log(`  Avg Likes        ${String(summaryA.fb.avgLikes).padStart(8)}   ${String(summaryB.fb.avgLikes).padStart(8)}    ${summaryA.fb.avgLikes > summaryB.fb.avgLikes ? "A" : summaryB.fb.avgLikes > summaryA.fb.avgLikes ? "B" : "-"}`);
  console.log(`  Avg Comments     ${String(summaryA.fb.avgComments).padStart(8)}   ${String(summaryB.fb.avgComments).padStart(8)}    ${summaryA.fb.avgComments > summaryB.fb.avgComments ? "A" : summaryB.fb.avgComments > summaryA.fb.avgComments ? "B" : "-"}`);
  console.log(`  Avg Shares       ${String(summaryA.fb.avgShares).padStart(8)}   ${String(summaryB.fb.avgShares).padStart(8)}    ${summaryA.fb.avgShares > summaryB.fb.avgShares ? "A" : summaryB.fb.avgShares > summaryA.fb.avgShares ? "B" : "-"}`);
  console.log(`  Avg Impressions  ${String(summaryA.fb.avgImpressions).padStart(8)}   ${String(summaryB.fb.avgImpressions).padStart(8)}    ${summaryA.fb.avgImpressions > summaryB.fb.avgImpressions ? "A" : summaryB.fb.avgImpressions > summaryA.fb.avgImpressions ? "B" : "-"}`);
  console.log(`  Avg Clicks       ${String(summaryA.fb.avgClicks).padStart(8)}   ${String(summaryB.fb.avgClicks).padStart(8)}    ${summaryA.fb.avgClicks > summaryB.fb.avgClicks ? "A" : summaryB.fb.avgClicks > summaryA.fb.avgClicks ? "B" : "-"}`);
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
