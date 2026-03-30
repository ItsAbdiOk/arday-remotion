import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { words, getSlug, type WordEntry } from "../src/data/words";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ENTRY = path.resolve(__dirname, "../src/index.ts");
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
// Caption
// ---------------------------------------------------------------------------

function buildCaption(word: WordEntry): string {
  const lines = [
    `${word.en} — ${word.so}`,
    word.type,
    "",
    word.sentenceEn,
    word.sentenceSo,
    "",
    "Ku baro Ingiriisiga af-Soomaali.",
    "Bilow — Waa bilaash!",
    "arday-nine.vercel.app",
    "",
    "#LearnEnglish #Somali #Soomaali #Arday #EnglishForSomalis #WordOfTheDay #ErayMaanta",
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

async function renderTodayStill(index: number, slug: string): Promise<string> {
  const outPath = path.resolve(__dirname, `../out/daily-${slug}.png`);

  if (skipRender && fs.existsSync(outPath)) {
    console.log(`  Skipping render — using existing ${outPath}`);
    return outPath;
  }

  console.log("  Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: ENTRY });

  console.log("  Rendering WordStill...");
  const comp = await selectComposition({
    serveUrl: bundled,
    id: "WordStill",
    inputProps: { index },
  });

  await renderStill({
    composition: comp,
    serveUrl: bundled,
    output: outPath,
    inputProps: { index },
  });

  console.log(`  Rendered: ${outPath}`);
  return outPath;
}

// ---------------------------------------------------------------------------
// Meta Graph API helpers
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

async function postToFacebookPage(
  imagePath: string,
  caption: string
): Promise<{ postId: string; imageUrl: string }> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const pageId = requireEnv("META_PAGE_ID");

  const url = `${GRAPH_API}/${pageId}/photos`;
  const formData = new FormData();
  const imageBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([imageBuffer], { type: "image/png" });
  formData.append("source", blob, path.basename(imagePath));
  formData.append("message", caption);
  formData.append("access_token", token);

  console.log("  Posting to Facebook Page...");
  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    console.error("Facebook API error:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(`  Facebook post ID: ${data.id}`);

  // Get the image URL from the posted photo
  const photoRes = await fetch(
    `${GRAPH_API}/${data.id}?fields=images&access_token=${token}`
  );
  const photoData = await photoRes.json();
  const imageUrl = photoData.images?.[0]?.source || "";

  return { postId: data.id, imageUrl };
}

async function postToInstagram(
  imageUrl: string,
  caption: string
): Promise<string> {
  const token = requireEnv("META_PAGE_ACCESS_TOKEN");
  const igAccountId = requireEnv("INSTAGRAM_BUSINESS_ACCOUNT_ID");

  // Step 1: Create media container
  console.log("  Creating Instagram media container...");
  const containerUrl = `${GRAPH_API}/${igAccountId}/media`;
  const containerRes = await fetch(containerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: token,
    }),
  });
  const containerData = await containerRes.json();

  if (!containerRes.ok) {
    console.error("Instagram container error:", JSON.stringify(containerData, null, 2));
    process.exit(1);
  }

  const creationId = containerData.id;
  console.log(`  Container ID: ${creationId}`);

  // Step 2: Wait for processing (poll status)
  let status = "IN_PROGRESS";
  let attempts = 0;
  while (status === "IN_PROGRESS" && attempts < 30) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `${GRAPH_API}/${creationId}?fields=status_code&access_token=${token}`
    );
    const statusData = await statusRes.json();
    status = statusData.status_code || "FINISHED";
    attempts++;
  }

  // Step 3: Publish
  console.log("  Publishing to Instagram...");
  const publishUrl = `${GRAPH_API}/${igAccountId}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token,
    }),
  });
  const publishData = await publishRes.json();

  if (!publishRes.ok) {
    console.error("Instagram publish error:", JSON.stringify(publishData, null, 2));
    process.exit(1);
  }

  console.log(`  Instagram post ID: ${publishData.id}`);
  return publishData.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Load .env if present
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
  } catch {
    // dotenv not installed — rely on environment variables directly
  }

  const index = getTodayIndex();
  const word = words[index];
  const slug = getSlug(word.en);
  const caption = buildCaption(word);

  console.log(`\n=== Arday Word of the Day ===`);
  console.log(`Date:  ${new Date().toISOString().split("T")[0]}`);
  console.log(`Index: ${index}`);
  console.log(`Word:  ${word.en} — ${word.so} (${word.type})`);
  console.log(`Slug:  ${slug}`);
  console.log();

  // Render
  const imagePath = await renderTodayStill(index, slug);

  // Show caption
  console.log(`\n--- Caption ---`);
  console.log(caption);
  console.log(`--- End Caption ---\n`);

  if (dryRun) {
    console.log("[DRY RUN] Would post to Facebook and Instagram.");
    console.log(`[DRY RUN] Image: ${imagePath}`);
    console.log("[DRY RUN] Done.");
    return;
  }

  // Post to Facebook (also hosts the image for Instagram)
  const { imageUrl } = await postToFacebookPage(imagePath, caption);

  if (!imageUrl) {
    console.error("Could not retrieve image URL from Facebook. Skipping Instagram.");
    return;
  }

  // Post to Instagram
  await postToInstagram(imageUrl, caption);

  console.log("\nDone! Posted to Facebook and Instagram.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
