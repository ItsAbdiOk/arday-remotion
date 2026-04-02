# Arday Remotion

Automated daily Word of the Day content pipeline for [Arday](https://arday-nine.vercel.app) — a Somali-English language learning app.

Renders bilingual vocabulary cards as images and videos using [Remotion](https://remotion.dev), then posts to Instagram and Facebook automatically via GitHub Actions.

<!-- STATUS:START -->
## Pipeline Status

| | |
|---|---|
| **Last posted** | 2026-04-02 |
| **Last word** | is not |
| **Caption style** | Style A |
| **Posts sent** | 6/6 (FB Feed, FB Story, FB Reel, IG Feed, IG Story, IG Reel) |
| **Total posts to date** | 1 |

## A/B Testing

| | |
|---|---|
| **Active test** | caption-style |
| **Started** | 2026-03-31 |
| **Status** | Running |
| **Tests remaining** | 4 of 5 |

### Test Queue
- [ ] **caption-style** (active)
- [ ] posting-time
- [ ] hashtag-set
- [ ] format-preference
- [ ] cta-vs-value


<!-- STATUS:END -->

## Daily Posts (6 per day)

| Platform | Format | Source |
|----------|--------|--------|
| Instagram Feed | 1080x1080 image | WordStill |
| Instagram Story | 1080x1920 image | WordStory |
| Instagram Reel | 1080x1920 video | WordVideo |
| Facebook Feed | 1080x1080 image | WordStill |
| Facebook Story | 1080x1920 image | WordStory |
| Facebook Reel | 1080x1920 video | WordVideo |

## Word List

1,374 English-Somali vocabulary pairs extracted from 120 lessons. Words rotate daily and won't repeat for 3.7 years.

## Setup

See [README-autopost.md](README-autopost.md) for the full setup guide.

## Stack

- **Remotion** — React-based video/image rendering
- **GitHub Actions** — Daily 8am UTC cron schedule
- **Meta Graph API** — Instagram + Facebook posting
- **Cloudflare R2** — Public video hosting for IG Reels
- **A/B Testing** — Automatic caption optimization with weekly reports
