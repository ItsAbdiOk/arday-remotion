# Auto-Post Setup Guide

Complete setup for the daily Word of the Day pipeline: Meta Graph API, Cloudflare R2, and GitHub Actions.

---

## Prerequisites

- A **Facebook Page** for your brand
- An **Instagram Business or Creator account** linked to that Facebook Page
- A **Meta Developer App** (free)
- A **Cloudflare account** with R2 enabled (free tier — 10 GB storage)

---

## Step 1 — Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com/) → **My Apps** → **Create App**
2. Choose **Business** type, name it (e.g. "Arday Auto Post")
3. Under **Use Cases** → **Customize**, add:
   - **Instagram Graph API**
   - **Pages API**
   - **Instagram Content Publishing** (listed as `instagram_business_content_publish`)
   - **Pages Manage Engagement**

---

## Step 2 — Get a non-expiring Page Access Token

### 2a. Short-lived user token
1. Open [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from the **Meta App** dropdown
3. Add these permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_manage_engagement`
   - `instagram_basic`
   - `instagram_business_content_publish`
4. Click **Generate Access Token** → approve in popup → copy the token

### 2b. Exchange for long-lived user token

```bash
curl "https://graph.facebook.com/v21.0/oauth/access_token?\
grant_type=fb_exchange_token&\
client_id=YOUR_APP_ID&\
client_secret=YOUR_APP_SECRET&\
fb_exchange_token=SHORT_LIVED_TOKEN"
```

Copy the `access_token` from the response.

### 2c. Get the non-expiring Page Access Token

```bash
curl "https://graph.facebook.com/v21.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
```

The response contains one entry per Page you admin. Copy `data[0].access_token` —
that's your **Page Access Token**. It doesn't expire unless you change your
Facebook password or revoke it.

### 2d. Find the Instagram Business Account ID

```bash
curl "https://graph.facebook.com/v21.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_PAGE_TOKEN"
```

Copy `instagram_business_account.id`.

---

## Step 3 — Cloudflare R2 setup

Instagram Reels API requires a **publicly accessible `video/mp4` URL**.
Facebook's video URLs are authenticated CDN links that IG rejects. R2 with its
public bucket URL is the cleanest free solution.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) → **R2 Object Storage**
2. Create a bucket named `arday-media`
3. Open the bucket → **Settings** → **Public Development URL** → **Enable**
4. Copy the **Public bucket URL** (e.g. `https://pub-xxxxxxxx.r2.dev`)
5. Also note the **S3 API endpoint** on that page (e.g. `https://<account>.r2.cloudflarestorage.com`)
6. Go to **R2 Object Storage** → **Manage R2 API Tokens** → **Create Account API Token**
7. Permission: **Object Read & Write**, scoped to the `arday-media` bucket
8. Leave IP filtering blank (GitHub Actions IPs rotate)
9. Copy **Access Key ID** and **Secret Access Key**
10. Set up a usage notification (optional): **Billing** → **Notifications** →
    **Add Notification** → product "R2 Storage" → threshold `1000000000` bytes (1 GB)

---

## Step 4 — Configure credentials

### Local development

```bash
cp .env.example .env
```

Fill in `.env`:

```
META_PAGE_ACCESS_TOKEN=EAAN...
META_PAGE_ID=1073913372471870
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841477984706545

R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=arday-media
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
```

### GitHub Actions

Add these repo secrets (**Settings → Secrets and variables → Actions**):

| Secret | Value |
|---|---|
| `META_PAGE_ACCESS_TOKEN` | Page Access Token from Step 2c |
| `META_PAGE_ID` | Facebook Page ID |
| `INSTAGRAM_BUSINESS_ACCOUNT_ID` | IG Business Account ID from Step 2d |
| `R2_ACCESS_KEY_ID` | From Step 3 |
| `R2_SECRET_ACCESS_KEY` | From Step 3 |

`R2_BUCKET_NAME`, `R2_PUBLIC_URL`, and `R2_ENDPOINT` are set in
`.github/workflows/daily-post.yml` as plain env vars (the public bucket URL
is not sensitive).

Quickly set them from your local `.env` with the `gh` CLI:

```bash
gh secret set META_PAGE_ACCESS_TOKEN --body "$(grep META_PAGE_ACCESS_TOKEN .env | cut -d= -f2-)"
gh secret set META_PAGE_ID --body "$(grep META_PAGE_ID .env | cut -d= -f2-)"
gh secret set INSTAGRAM_BUSINESS_ACCOUNT_ID --body "$(grep INSTAGRAM_BUSINESS_ACCOUNT_ID .env | cut -d= -f2-)"
gh secret set R2_ACCESS_KEY_ID --body "$(grep R2_ACCESS_KEY_ID .env | cut -d= -f2-)"
gh secret set R2_SECRET_ACCESS_KEY --body "$(grep R2_SECRET_ACCESS_KEY .env | cut -d= -f2-)"
```

> **Note:** always use `--body "..."` with `gh secret set`. Piping tokens via
> stdin sometimes introduces trailing whitespace that Meta rejects with
> "Cannot parse access token".

---

## Step 5 — Usage

### Dry run (render + print caption, no posting)

```bash
npx ts-node scripts/auto-post.ts --dry-run
npx ts-node scripts/auto-post.ts --dry-run --index 0     # HELLO
npx ts-node scripts/auto-post.ts --dry-run --index 100   # word #100
```

### Real post

```bash
npx ts-node scripts/auto-post.ts
```

Renders 3 compositions and publishes 6 posts:
- FB Feed (image) + FB Story (image) + FB Reel (video)
- IG Feed (image) + IG Story (image) + IG Reel (video via R2)

Logs an entry to `out/ab-test-log.json` and regenerates the STATUS section in
`README.md`.

### Skip rendering (reuse existing files)

```bash
npx ts-node scripts/auto-post.ts --skip-render
```

Useful when debugging the upload flow without waiting for Remotion.

### Generate A/B engagement report

```bash
npm run ab-report
```

Hits the Meta Graph API for every logged post and writes `out/ab-report.json`
with per-variant averages. Also prints a comparison table to stdout.

### Manually trigger the GitHub Action

```bash
# Daily post (runs immediately)
gh workflow run "Daily Word of the Day Post"

# With a specific word index
gh workflow run "Daily Word of the Day Post" -f index=42

# Dry run via workflow
gh workflow run "Daily Word of the Day Post" -f dry_run=true

# Weekly A/B report
gh workflow run "Weekly A/B Test Report"
```

---

## Workflows

| Workflow | Schedule | What it does |
|---|---|---|
| `daily-post.yml` | `0 8 * * *` (8am UTC) | Render + post 6 items. Commits updated `README.md` status. |
| `weekly-report.yml` | `0 9 * * 0` (Sun 9am UTC) | Run `ab-report.ts` + `ab-optimize.ts`. Commits A/B logs + any test-queue advancements. |

Both support manual trigger via the Actions tab or `gh workflow run`.

---

## How the daily word is picked

`dayOfYear % words.length`. With 1,374 words, a word won't repeat for ~3.7 years.
Override with `--index N` locally or the `index` input on the workflow.

---

## A/B testing

Tests are defined in `src/data/ab-config.ts`. Each test has:
- `variants` — e.g. two or three versions
- `metric` — `clicks`, `reach`, or `engagement`
- `minDays` / `maxDays` — when to pick a winner

`ab-optimize.ts` runs weekly. If one variant beats the other by ≥20% after
`minDays`, it's locked in and the next test in the queue activates. No winner
after `maxDays` → higher-performer wins and moves on.

**Current queue (in order):**
1. `background-music` — ambient vs electronic _(active)_
2. `caption-style` — short vs long with app pitch
3. `posting-time` — 8am vs 6pm UTC (uses `scheduled_publish_time`)
4. `hashtag-set` — Somali / English / mixed
5. `format-preference` — reel vs still in main feed
6. `cta-vs-value` — CTA caption vs pure educational

Decisions are logged to `out/ab-optimization-log.json`.

---

## Adding content

### Word
Edit `src/data/words.ts`. Each entry: `en`, `so`, `type`, `sentenceEn`, `sentenceSo`.
The slug `getSlug(en)` determines the audio filename in `public/audio/vocabulary/{slug}.mp3`.

### Music track
1. Drop the MP3 into `public/music/`
2. Add an entry in `src/data/music.ts` with a unique `id`
3. Add the `id` to the `background-music` variants in `src/data/ab-config.ts`

### A/B test
Append a `TestDefinition` to `testQueue` in `src/data/ab-config.ts`.
The optimizer will activate it after earlier tests conclude.

---

## Token refresh

The Page Access Token obtained in Step 2c doesn't expire unless:
- You change your Facebook password
- You explicitly revoke it
- Meta flags it for security (rare)

If the daily workflow starts failing with `error_subcode: 460` ("session has been
invalidated"), repeat Step 2 and update the `META_PAGE_ACCESS_TOKEN` secret.

---

## Resetting the R2 API token

1. Cloudflare dashboard → **R2 Object Storage** → **Manage R2 API Tokens**
2. Click the token → **Roll** (generates new credentials, invalidates old)
3. Update both `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY` in GitHub + `.env`:

```bash
gh secret set R2_ACCESS_KEY_ID --body "NEW_ACCESS_KEY_ID"
gh secret set R2_SECRET_ACCESS_KEY --body "NEW_SECRET_ACCESS_KEY"
```

---

## Debugging

See `CLAUDE.md` for the full list of gotchas encountered during development.
Most common:
- **Token rejected** — re-generate a Page token, ensure all 5 permissions are granted
- **IG Reel fails with 2207076** — check that the R2 URL returns `Content-Type: video/mp4` (not `octet-stream`), and that the bucket's Public Development URL is enabled
- **Remotion ENOENT on `public/audio`** — broken symlink in CI. The script handles this, but verify the symlink/dir exists locally before previewing
