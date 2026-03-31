import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import {
  renderStill,
  renderMedia,
  selectComposition,
} from "@remotion/renderer";
import { words, getSlug } from "../src/data/words";
import { buildCaption, pickCaptionStyle, type CaptionStyle } from "../src/data/captions";
import { pickVariant, getScheduledPublishTime, testQueue, activeTest } from "../src/data/ab-config";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ENTRY = path.resolve(__dirname, "../src/index.ts");
const OUT_DIR = path.resolve(__dirname, "../out");
const LOG_FILE = path.join(OUT_DIR, "ab-test-log.json");
const GRAPH_API = "https://graph.facebook.com/v21.0";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const skipRender = args.includes("--skip-render");

function getFlagValue(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : undefined;
}

// ---------------------------------------------------------------------------
// Today's word
// ---------------------------------------------------------------------------

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTodayIndex(): number {
  const override = getFlagValue("--index");
  if (override !== undefined) {
    const n = parseInt(override, 10);
    if (isNaN(n) || n < 0 || n >= words.length) {
      console.error(`Invalid index: ${override}. Must be 0-${words.length - 1}`);
      process.exit(1);
    }
    return n;
  }
  return getDayOfYear() % words.length;
}

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing environment variable: ${key}`);
    console.error("Copy .env.example to .env and fill in your credentials.");
    process.exit(1);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Render all 3 compositions
// ---------------------------------------------------------------------------

interface RenderResult {
  feedPath: string;
  storyPath: string;
  reelPath: string;
}

async function renderAll(index: number, slug: string): Promise<RenderResult> {
  const feedPath = path.join(OUT_DIR, `daily-${slug}-feed.png`);
  const storyPath = path.join(OUT_DIR, `daily-${slug}-story.png`);
  const reelPath = path.join(OUT_DIR, `daily-${slug}-reel.mp4`);

  if (skipRender && fs.existsSync(feedPath) && fs.existsSync(storyPath) && fs.existsSync(reelPath)) {
    console.log("  Skipping render — using existing files");
    return { feedPath, storyPath, reelPath };
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Ensure public/audio exists (may be a broken symlink in CI)
  const publicAudio = path.resolve(__dirname, "../public/audio");
  try {
    const stat = fs.lstatSync(publicAudio);
    if (stat.isSymbolicLink() && !fs.existsSync(publicAudio)) {
      fs.unlinkSync(publicAudio); // remove broken symlink
      fs.mkdirSync(publicAudio, { recursive: true });
    }
  } catch {
    fs.mkdirSync(publicAudio, { recursive: true });
  }

  console.log("  Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: ENTRY });

  // Feed still (1080x1080)
  console.log("  Rendering WordStill (feed)...");
  const feedComp = await selectComposition({
    serveUrl: bundled, id: "WordStill", inputProps: { index },
  });
  await renderStill({
    composition: feedComp, serveUrl: bundled, output: feedPath, inputProps: { index },
  });
  console.log(`    ${feedPath}`);

  // Story still (1080x1920)
  console.log("  Rendering WordStory (story)...");
  const storyComp = await selectComposition({
    serveUrl: bundled, id: "WordStory", inputProps: { index },
  });
  await renderStill({
    composition: storyComp, serveUrl: bundled, output: storyPath, inputProps: { index },
  });
  console.log(`    ${storyPath}`);

  // Video reel (1080x1920, 10s)
  const audioDir = path.resolve(__dirname, "../public/audio/vocabulary");
  const hasAudio = fs.existsSync(audioDir) && fs.readdirSync(audioDir).length > 0;
  console.log(`  Rendering WordVideo (reel)...${hasAudio ? "" : " (music only, no spoken word)"}`);
  const videoComp = await selectComposition({
    serveUrl: bundled, id: "WordVideo", inputProps: { index, hasAudio },
  });
  await renderMedia({
    composition: videoComp, serveUrl: bundled, codec: "h264",
    outputLocation: reelPath, inputProps: { index, hasAudio },
  });
  console.log(`    ${reelPath}`);

  return { feedPath, storyPath, reelPath };
}

// ---------------------------------------------------------------------------
// Facebook API helpers
// ---------------------------------------------------------------------------

async function fbUploadPhoto(
  imagePath: string,
  caption: string,
  scheduledTime?: number | null
): Promise<{ postId: string; imageUrl: string }> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const pageId = requireEnv("META_PAGE_ID");

  const url = `${GRAPH_API}/${pageId}/photos`;
  const formData = new FormData();
  const blob = new Blob([fs.readFileSync(imagePath)], { type: "image/png" });
  formData.append("source", blob, path.basename(imagePath));
  if (caption) formData.append("message", caption);
  if (scheduledTime) {
    formData.append("published", "false");
    formData.append("scheduled_publish_time", String(scheduledTime));
  }
  formData.append("access_token", token);

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    console.error(`  FB photos error:`, JSON.stringify(data, null, 2));
    return { postId: "", imageUrl: "" };
  }

  // Get hosted image URL
  let imageUrl = "";
  try {
    const photoRes = await fetch(
      `${GRAPH_API}/${data.id || data.post_id}?fields=images&access_token=${token}`
    );
    const photoData = await photoRes.json();
    imageUrl = photoData.images?.[0]?.source || "";
  } catch {}

  return { postId: data.id || data.post_id || "", imageUrl };
}

async function fbUploadStory(imagePath: string): Promise<string> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const pageId = requireEnv("META_PAGE_ID");

  // Step 1: Upload photo as unpublished
  const formData = new FormData();
  const blob = new Blob([fs.readFileSync(imagePath)], { type: "image/png" });
  formData.append("source", blob, path.basename(imagePath));
  formData.append("published", "false");
  formData.append("access_token", token);

  const uploadRes = await fetch(`${GRAPH_API}/${pageId}/photos`, {
    method: "POST",
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok) {
    console.error("  FB story photo upload error:", JSON.stringify(uploadData, null, 2));
    return "";
  }
  const photoId = uploadData.id;

  // Step 2: Create story using the photo_id
  const storyRes = await fetch(`${GRAPH_API}/${pageId}/photo_stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      photo_id: photoId,
      access_token: token,
    }),
  });
  const storyData = await storyRes.json();
  if (!storyRes.ok) {
    console.error("  FB story publish error:", JSON.stringify(storyData, null, 2));
    return "";
  }

  return storyData.id || storyData.post_id || "";
}

async function fbUploadVideoReel(videoPath: string, caption: string): Promise<string> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const pageId = requireEnv("META_PAGE_ID");
  const fileBytes = fs.readFileSync(videoPath);

  // Use the simple video upload endpoint instead of resumable
  const formData = new FormData();
  const blob = new Blob([fileBytes], { type: "video/mp4" });
  formData.append("source", blob, path.basename(videoPath));
  formData.append("description", caption);
  formData.append("access_token", token);

  // Try direct video upload first
  const res = await fetch(`${GRAPH_API}/${pageId}/videos`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("  FB video upload error:", JSON.stringify(data, null, 2));
    return "";
  }

  return data.id || "";
}

// ---------------------------------------------------------------------------
// Instagram API helpers
// ---------------------------------------------------------------------------

async function igCreateAndPublish(
  params: Record<string, string | number>
): Promise<string> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const igId = requireEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID");

  // Create container
  const containerRes = await fetch(`${GRAPH_API}/${igId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, access_token: token }),
  });
  const containerData = await containerRes.json();
  if (!containerRes.ok) {
    console.error("  IG container error:", JSON.stringify(containerData, null, 2));
    return "";
  }
  const creationId = containerData.id;

  // Poll for processing
  let status = "IN_PROGRESS";
  let attempts = 0;
  while (status === "IN_PROGRESS" && attempts < 60) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `${GRAPH_API}/${creationId}?fields=status_code&access_token=${token}`
    );
    const statusData = await statusRes.json();
    status = statusData.status_code || "FINISHED";
    attempts++;
  }

  // Publish
  const publishRes = await fetch(`${GRAPH_API}/${igId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) {
    console.error("  IG publish error:", JSON.stringify(publishData, null, 2));
    return "";
  }

  return publishData.id || "";
}

// ---------------------------------------------------------------------------
// A/B test logging
// ---------------------------------------------------------------------------

interface LogEntry {
  date: string;
  wordIndex: number;
  word: string;
  captionStyle: CaptionStyle;
  abTestName: string;
  abVariant: string;
  fbPostId: string;
  igPostId: string;
  fbStoryId: string;
  igStoryId: string;
  fbReelId: string;
  igReelId: string;
}

function appendLog(entry: LogEntry) {
  let log: LogEntry[] = [];
  if (fs.existsSync(LOG_FILE)) {
    try {
      log = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    } catch {}
  }
  log.push(entry);
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {}

  const dayOfYear = getDayOfYear();
  const index = getTodayIndex();
  const word = words[index];
  const slug = getSlug(word.en);
  const captionStyle = pickCaptionStyle(dayOfYear);
  const caption = buildCaption(word, captionStyle);

  // Active A/B test
  const currentTest = testQueue[activeTest.testIndex];
  const variant = pickVariant(dayOfYear);
  const scheduledTime = getScheduledPublishTime(variant);

  console.log(`\n=== Arday Word of the Day ===`);
  console.log(`Date:    ${new Date().toISOString().split("T")[0]}`);
  console.log(`Index:   ${index} / ${words.length}`);
  console.log(`Word:    ${word.en} — ${word.so} (${word.type})`);
  console.log(`Caption: Style ${captionStyle}`);
  console.log(`A/B Test: ${currentTest?.name || "none"} — variant: ${variant.id}`);
  if (scheduledTime) console.log(`Scheduled: ${new Date(scheduledTime * 1000).toISOString()}`);
  console.log();

  // Render 3 compositions
  const { feedPath, storyPath, reelPath } = await renderAll(index, slug);

  console.log(`\n--- Caption (Style ${captionStyle}) ---`);
  console.log(caption);
  console.log(`--- End Caption ---\n`);

  if (dryRun) {
    console.log("[DRY RUN] Would post 6 items:");
    console.log(`  FB Feed:  ${feedPath}`);
    console.log(`  FB Story: ${storyPath}`);
    console.log(`  FB Reel:  ${reelPath}`);
    console.log(`  IG Feed:  (from FB-hosted URL)`);
    console.log(`  IG Story: (from FB-hosted URL)`);
    console.log(`  IG Reel:  (from FB-hosted URL)`);
    console.log("[DRY RUN] Done.");
    return;
  }

  // --- FACEBOOK ---
  console.log("=== Facebook ===");

  // FB Feed
  console.log("  [FB Feed] Uploading...");
  const fbFeed = await fbUploadPhoto(feedPath, caption, scheduledTime);
  console.log(`  [FB Feed] ID: ${fbFeed.postId}`);

  // FB Story
  console.log("  [FB Story] Uploading...");
  const fbStoryId = await fbUploadStory(storyPath);
  console.log(`  [FB Story] ID: ${fbStoryId}`);

  // FB Reel
  console.log("  [FB Reel] Uploading...");
  const fbReelId = await fbUploadVideoReel(reelPath, caption);
  console.log(`  [FB Reel] ID: ${fbReelId}`);

  // --- INSTAGRAM ---
  console.log("\n=== Instagram ===");

  // IG Feed
  if (fbFeed.imageUrl) {
    console.log("  [IG Feed] Creating...");
    const igPostId = await igCreateAndPublish({
      image_url: fbFeed.imageUrl,
      caption,
    });
    console.log(`  [IG Feed] ID: ${igPostId}`);

    // IG Story — use the feed image URL (IG handles cropping for stories)
    console.log("  [IG Story] Creating...");
    const igStoryId = await igCreateAndPublish({
      image_url: fbFeed.imageUrl,
      media_type: "STORIES",
    });
    console.log(`  [IG Story] ID: ${igStoryId}`);

    // IG Reel — requires a publicly accessible video URL.
    // FB video source URLs are authenticated and can't be used by IG.
    // TODO: Add public video hosting (e.g. S3/R2) to enable IG Reels from CI.
    console.log("  [IG Reel] Skipped (needs public video hosting — FB Reel posted instead)");
    let igReelId = "";
    console.log(`  [IG Reel] ID: ${igReelId}`);

    // Log
    appendLog({
      date: new Date().toISOString().split("T")[0],
      wordIndex: index,
      word: word.en,
      captionStyle,
      abTestName: currentTest?.name || "none",
      abVariant: variant.id,
      fbPostId: fbFeed.postId,
      igPostId,
      fbStoryId,
      igStoryId,
      fbReelId,
      igReelId,
    });
  } else {
    console.error("  Could not get image URL from Facebook. Skipping Instagram.");
  }

  console.log("\nDone! Posted to Facebook and Instagram.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
