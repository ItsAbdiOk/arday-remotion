# CLAUDE.md

Project memory for Claude Code. This file describes the architecture, common
commands, conventions, and gotchas for this repo. Read it before making changes.

## Project

**Arday Remotion** — automated daily content pipeline for [Arday](https://arday-nine.vercel.app),
a Somali-English language learning app. Every day at 8am UTC, a GitHub Action
renders a bilingual vocabulary card in three formats and publishes six posts to
Instagram and Facebook.

## Architecture

```
GitHub Actions (cron)  →  Remotion (render 3 comps)  →  Cloudflare R2 (video host)
                                                     →  Meta Graph API (6 posts)
                                                     →  commit README status
```

Everything runs in the cloud. Local development is only needed when changing
Remotion templates or adding words/music.

## Key paths

```
src/
  Root.tsx                     Remotion entry — registers all compositions
  WordOfTheDay/
    Still.tsx                  1080x1080 feed image
    Story.tsx                  1080x1920 story image (scale: 0.6 for IG safe zones)
    Video.tsx                  1080x1920 10s video — takes musicTrackId prop
  Promo/                       One-off 15s/20s/30s promo videos (built, not auto-posted)
  components/
    WordCard.tsx               Shared card layout used by Still/Story
    ArdayBranding.tsx          Logo + footer
  data/
    words.ts                   1,374 English-Somali word entries + getSlug()
    captions.ts                Style A (short) / Style B (long) templates
    ab-config.ts               Test queue + activeTest state (updated by optimizer)
    music.ts                   Background music track registry

scripts/
  auto-post.ts                 Main pipeline. Renders, uploads, posts, logs
  ab-report.ts                 Pulls engagement metrics from Meta API
  ab-optimize.ts               Picks winners, advances activeTest.testIndex
  extract-words.ts             One-time: pulls vocab from SomLearn lessons
  update-readme.ts             Regenerates the STATUS block in README.md
  render-all.ts                Batch render all words (not used in CI)

.github/workflows/
  daily-post.yml               Cron 0 8 * * *  (8am UTC)
  weekly-report.yml            Cron 0 9 * * 0  (Sun 9am UTC)

public/
  music/
    bg-loop.mp3                "Ambient chill" variant
    promo-beat.mp3             "Upbeat electronic" variant — current default
  audio/                       SYMLINK to local SomLearn (vocab pronunciations).
                               Not in git. CI renders video without spoken audio.

out/                           Render output + logs. gitignored except for
                               ab-test-log.json, ab-report.json, ab-optimization-log.json
                               which get committed by the workflows.
docs/                          Sample PNG renders embedded in README
```

## Daily flow (what `auto-post.ts` does)

1. Pick today's word: `dayOfYear % words.length` (1,374 words → repeats every 3.7 years)
2. Pick A/B variant for the active test (`dayOfYear % variants.length`)
3. Render 3 compositions to `out/daily-{slug}-{feed,story,reel}.{png,mp4}`
4. **FB Feed**: POST `{page-id}/photos` with binary → get `imageUrl` back
5. **FB Story**: upload photo as `published=false`, then POST `{page-id}/photo_stories` with `photo_id`
6. **FB Reel**: POST `{page-id}/videos` with binary (not the resumable API — simpler, works)
7. **IG Feed**: create media container with FB-hosted `imageUrl` → publish
8. **IG Story**: create container with `media_type=STORIES` + same FB `imageUrl` → publish
9. **IG Reel**: upload video to Cloudflare R2 → create container with R2 `video_url` + `media_type=REELS` → publish
10. Append log entry to `out/ab-test-log.json`
11. Regenerate STATUS block in `README.md`, commit `[skip ci]`

## A/B testing

Queue in `src/data/ab-config.ts`. Variants alternate deterministically by `dayOfYear`.
Each test has `minDays` / `maxDays`. Weekly, `ab-optimize.ts` reads the engagement
report and, if one variant beats the other by ≥20% after `minDays`, locks it in
and advances `activeTest.testIndex`. No winner after `maxDays` → pick higher reach.

**Current queue** (in order):
1. `background-music` — ambient vs electronic (engagement, 14-28 days)  ← active
2. `caption-style` — A (short) vs B (long pitch) (clicks, 30-45 days)
3. `posting-time` — 8am UTC vs 6pm UTC via `scheduled_publish_time` (reach, 30-45 days)
4. `hashtag-set` — Somali vs English vs mixed (reach, 30-45 days)
5. `format-preference` — reel vs still in main feed (reach, 30-45 days)
6. `cta-vs-value` — with CTA vs no CTA (engagement, 30-45 days)

## Required secrets (GitHub + `.env`)

```
META_PAGE_ACCESS_TOKEN         Page-level token from /me/accounts (non-expiring)
META_PAGE_ID                   Facebook Page numeric ID
INSTAGRAM_BUSINESS_ACCOUNT_ID  Linked IG Business/Creator account ID
R2_ACCESS_KEY_ID               Cloudflare R2 token (Object R/W on bucket)
R2_SECRET_ACCESS_KEY           Cloudflare R2 token secret
```

`R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `R2_ENDPOINT` are hardcoded in the workflow
env block (not secrets — bucket URL is already public).

See `README-autopost.md` for the Meta App + token generation walkthrough.

## Common commands

```bash
# Preview compositions in the Remotion studio
npm run preview

# Dry run today's post (renders, shows caption, no upload)
npx ts-node scripts/auto-post.ts --dry-run

# Dry run a specific word by index
npx ts-node scripts/auto-post.ts --dry-run --index 0

# Real post (needs .env with all 5 secrets)
npx ts-node scripts/auto-post.ts

# Skip render, reuse existing files (use for debugging upload flow)
npx ts-node scripts/auto-post.ts --skip-render

# Generate A/B report
npm run ab-report

# Manually trigger the daily workflow on GitHub
gh workflow run "Daily Word of the Day Post" --repo ItsAbdiOk/arday-remotion

# Type-check
npx tsc --noEmit
```

## Adding new content

### New word
Edit `src/data/words.ts` directly. `WordEntry` type: `en`, `so`, `type`, `sentenceEn`, `sentenceSo`.
`getSlug()` maps the English word to the audio filename in `public/audio/vocabulary/`.

### New music track
1. Drop the MP3 in `public/music/`
2. Add an entry in `src/data/music.ts` with a unique `id`
3. Add the `id` to the `background-music` variants in `src/data/ab-config.ts`

### New A/B test
Append to `testQueue` in `src/data/ab-config.ts`. The optimizer will advance to it
after the current tests conclude. To make something active immediately, reorder
the queue and reset `activeTest = { testIndex: 0, startDate: "YYYY-MM-DD", lockedWinner: null }`.

## Gotchas (things that broke before)

- **`public/audio` is a symlink**, not real files. Removed from git. Auto-post detects
  broken symlink in CI and replaces with empty dir so Remotion's bundler doesn't crash.
  Video renders without spoken audio when the symlink is broken.
- **IG Reels need a public `video/mp4` URL.** FB video source URLs are authenticated
  CDN links and IG can't download them. GitHub Release assets serve as
  `application/octet-stream` with redirects — also rejected. Cloudflare R2 with its
  `pub-*.r2.dev` URL and correct `Content-Type` is the only thing that works.
- **FB Story endpoint `/photo_stories` needs `photo_id`, not a file upload.** Upload
  the photo first with `published=false`, then pass `photo_id` to the story endpoint.
- **FB Reels** — we tried the resumable upload API (`upload_phase=start|transfer|finish`)
  and it threw error 6000. The simple `/{page-id}/videos` endpoint with `FormData`
  works for short videos (our 10s reels).
- **Meta tokens** from the Graph API Explorer are short-lived. You must exchange
  for a long-lived user token, then call `/me/accounts` to get the non-expiring
  Page Access Token. Password changes invalidate the session and require a fresh
  token. See `README-autopost.md`.
- **`gh secret set` mangles pasted tokens** with leading whitespace / newlines.
  Always use `--body "..."` with no piping, or the token may be unparseable by Meta.
- **IG Story scale** — Stories get cropped by IG's UI overlay. `WordStory`
  uses `scale={0.6}` on `WordCard` with `"250px 100px 320px"` padding so nothing
  is clipped by the username header or reply bar.
- **Permission `instagram_content_publish` was renamed** to `instagram_business_content_publish`
  in the Meta dashboard. Graph API Explorer still uses the old name. Both work.

## Conventions

- **Commits** — use descriptive multi-line messages. Co-author Claude on AI-assisted work.
- **Don't commit `.env`** — it's in `.gitignore`.
- **Don't commit `out/daily-*`** — only the log files.
- **Don't break the README `STATUS:START/END` block** — it's auto-regenerated by the workflow.
- **TypeScript strict mode is on** — `npx tsc --noEmit` must pass before pushing.
- **Workflows that modify tracked files** commit with `[skip ci]` to avoid infinite loops.

## Repo

- GitHub: https://github.com/ItsAbdiOk/arday-remotion (public)
- Branch: `main` (no other branches)
- Workflows use `permissions: contents: write` to commit status + A/B results back.
