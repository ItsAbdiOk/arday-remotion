import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderStill, renderMedia, selectComposition } from "@remotion/renderer";
import { words, getSlug } from "./src/data/words";

const ENTRY = path.resolve(__dirname, "src/index.ts");
const OUTPUT_STILLS = path.resolve(__dirname, "output/stills");
const OUTPUT_VIDEOS = path.resolve(__dirname, "output/videos");

const args = process.argv.slice(2);
const stillsOnly = args.includes("--stills");
const videosOnly = args.includes("--videos");
const doStills = !videosOnly;
const doVideos = !stillsOnly;

async function main() {
  console.log("Bundling Remotion project...");
  const bundled = await bundle({ entryPoint: ENTRY });

  fs.mkdirSync(OUTPUT_STILLS, { recursive: true });
  fs.mkdirSync(OUTPUT_VIDEOS, { recursive: true });

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const slug = getSlug(word.en);
    console.log(`\n[${i + 1}/${words.length}] ${word.en} → ${word.so}`);

    if (doStills) {
      // Square (1080x1080)
      const squareComp = await selectComposition({
        serveUrl: bundled,
        id: "WordStill",
        inputProps: { index: i },
      });
      const squarePath = path.join(OUTPUT_STILLS, `${slug}-square.png`);
      await renderStill({
        composition: squareComp,
        serveUrl: bundled,
        output: squarePath,
        inputProps: { index: i },
      });
      console.log(`  ✓ ${squarePath}`);

      // Story (1080x1920)
      const storyComp = await selectComposition({
        serveUrl: bundled,
        id: "WordStory",
        inputProps: { index: i },
      });
      const storyPath = path.join(OUTPUT_STILLS, `${slug}-story.png`);
      await renderStill({
        composition: storyComp,
        serveUrl: bundled,
        output: storyPath,
        inputProps: { index: i },
      });
      console.log(`  ✓ ${storyPath}`);
    }

    if (doVideos) {
      const videoComp = await selectComposition({
        serveUrl: bundled,
        id: "WordVideo",
        inputProps: { index: i },
      });
      const videoPath = path.join(OUTPUT_VIDEOS, `${slug}.mp4`);
      await renderMedia({
        composition: videoComp,
        serveUrl: bundled,
        codec: "h264",
        outputLocation: videoPath,
        inputProps: { index: i },
      });
      console.log(`  ✓ ${videoPath}`);
    }
  }

  console.log("\nDone! All content rendered.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
