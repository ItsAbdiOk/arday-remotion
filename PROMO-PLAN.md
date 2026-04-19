# 3 Promo Videos for Arday — UI Replication Approach (Remotion)

> **Status: implemented.** The three promo videos (`TheProblem`, `AppWalkthrough`,
> `WhyArday`) described below are built and live in `src/Promo/`. Rendered MP4s
> are in `out/content-videos/` and imported into the "content-videos" album in
> Apple Photos. This document is kept as a historical design record. For
> day-to-day pipeline docs see [`README.md`](README.md),
> [`CLAUDE.md`](CLAUDE.md), and [`README-autopost.md`](README-autopost.md).

## Context
Instead of text-on-screen slides, these videos **replicate the actual Arday app UI** as React components and animate them — like a founder doing a live product demo. This follows the Remotion "Presscut" pattern where the video IS the product experience.

**Project:** `~/Documents/GitHub/arday-remotion/` (separate from Next.js app, already gitignored)

---

## Video 1: "The Problem" — 15s (TikTok/Reels hook)

**Purpose:** Grab attention. State the problem. Show Arday as the answer.
**Format:** 1080x1920, 30fps, 450 frames

### Storyboard

| Time | What the viewer sees | Details |
|------|---------------------|---------|
| 0-2s | Big animated counter: **25,000,000** → text: "Somali speakers" | Number uses spring animation, white on dark bg (#1c1917). Counter animates digits. |
| 2-4s | Counter morphs to **0** → text: "apps teach them English" | Dramatic contrast. Red tint (#ef4444) on the zero. |
| 4-6s | Mockup of Duolingo-style UI (greyed out, blurred) with text overlay: "Ingiriisi oo dhan." | Show a generic English-only lesson interface, faded/grey. Red X mark slides over it. |
| 6-8s | Screen wipe → Arday app UI appears | Replicate the actual lesson view: progress bar fills, question appears ("My name ___ Ahmed"), options slide in. Use real app colors/typography. |
| 8-10s | Correct answer highlights green → "+10 XP" popup floats up | Replicate XPPopup animation exactly (scale 0.8→1, float up, fade). Emerald glow. |
| 10-12s | Pull back to show phone frame with Arday running | Three feature pills animate in below: "📶 Offline" · "🆓 Bilaash" · "🔊 Cod" |
| 12-15s | Arday logo + tagline + CTA | "Ku baro Ingiriisiga. Af-Soomaali." + "arday-nine.vercel.app" + "Bilow — Waa bilaash" |

### Components to build
- `AnimatedCounter.tsx` — spring-animated number display with tabular-nums
- `FakeLesson.tsx` — replicates lesson view (progress bar, question, options) from LandingPage.tsx hero preview
- `XPPopupAnim.tsx` — replicates the float-up XP animation
- `FeaturePills.tsx` — three emerald pills with icons
- `PhoneFrame.tsx` — optional rounded phone bezel wrapping the UI

---

## Video 2: "App Walkthrough" — 30s (Instagram Reels / YouTube)

**Purpose:** Full product tour. Show every feature with the real UI.
**Format:** 1080x1920, 30fps, 900 frames

### Storyboard

| Time | Screen shown | Transition |
|------|-------------|------------|
| 0-2s | Arday logo on dark bg | Fade in |
| 2-5s | **Dashboard** — replicate the actual dashboard: "Arday" header, streak counter (🔥 3), XP stats grid (4 cards), "Bilow casharka 1" nudge card with gradient | Slide up from bottom |
| 5-9s | **Lesson list** — replicate lessons page: "Casharrada" header, level pills at top, 4 lesson cards (2 completed with checkmarks, 1 active with glow, 1 locked) | Crossfade. Cards stagger in with 50ms delay each. |
| 9-14s | **Active lesson** — replicate lesson view: progress bar (3/10, 30% fill with glow), "Dooro jawaabta saxda ah" instruction, "My name ___ Ahmed" question, 3 options slide in, "is" gets selected → highlights green → "+10 XP" floats up | Cursor/tap indicator moves to correct answer |
| 14-18s | **Audio feature** — replicate Dhageyso mockup: "Good morning" word card, play button pulses, waveform bars animate left-to-right filling emerald, syllable breakdown appears below | Play actual audio: `public/audio/vocabulary/good-morning.mp3` |
| 18-22s | **Conversation** — replicate Wada-hadal mockup: "Dhakhtarka" header, chat bubbles appear one by one (doctor→user→doctor), with English + Somali translations | Bubbles slide in from left/right with 400ms stagger |
| 22-25s | **Spaced repetition** — replicate Ku xasuuso mockup: "Dib u eeg" warning badge, fill-in-blank question, correct answer selected with checkmark | Quick sequence |
| 25-28s | **Stats summary** — animated counters: **120** cashar · **561** erayg · **15** wada-hadal | Numbers count up with spring animation |
| 28-30s | CTA screen: "Bilow maanta." + "Bilaash. Account la'aan." + URL | Fade in |

### Components to build
- `DashboardMock.tsx` — replicate dashboard header, streak, stats grid, nudge card
- `LessonListMock.tsx` — replicate level pills + 4 lesson cards with status indicators
- `LessonViewMock.tsx` — progress bar + question + animated answer selection
- `AudioMock.tsx` — play button + animated waveform bars + syllable text (reuse from landing page)
- `ConversationMock.tsx` — chat bubbles appearing sequentially (reuse from landing page)
- `SpacedRepMock.tsx` — review badge + question + answer (reuse from landing page)
- `StatsCounter.tsx` — three animated counters in a row

---

## Video 3: "Why Arday?" — 20s (TikTok/Reels comparison)

**Purpose:** Competitive differentiation using side-by-side UI comparison.
**Format:** 1080x1920, 30fps, 600 frames

### Storyboard

| Time | Left side (grey, "Kale") | Right side (emerald, "Arday") |
|------|-------------------------|------------------------------|
| 0-2s | Header appears: "Kale" (grey) | Header appears: "Arday" (emerald) |
| 2-5s | Fake English-only lesson UI (all text in English, grey/muted, question unreadable) | Real Arday lesson UI (Somali instructions, clear question, emerald highlights) |
| 5-8s | WiFi icon with ❌ — "Requires internet" in grey | WiFi icon with ✓ — "Offline ka shaqeysa" in emerald |
| 8-11s | Price tag: "$9.99/mo" crossed out | Badge: "Bilaash — 100%" in emerald |
| 11-14s | Generic textbook icon | "Oxford English File" badge with book icon |
| 14-17s | Left side fades to black | Right side expands full-width — Arday logo + "App-ka ugu horreeya" |
| 17-20s | Full screen CTA | "Bilow — Waa bilaash" + URL |

### Components to build
- `SplitScreen.tsx` — two-column layout that animates comparison rows
- `ComparisonRow.tsx` — left (grey/muted) vs right (emerald/bright) item
- `FakeLessonEnglish.tsx` — greyed out English-only lesson UI (contrast against real Arday UI)

---

## Shared Components (reusable across all 3 videos)

| Component | Based on | Used in |
|-----------|----------|---------|
| `PhoneFrame.tsx` | Rounded bezel wrapper | All 3 |
| `ProgressBar.tsx` | Lesson progress bar from app (gradient fill + glow) | Videos 1, 2 |
| `QuestionView.tsx` | Fill-in-blank with options from LandingPage hero preview | Videos 1, 2 |
| `ChatBubble.tsx` | Conversation bubbles from LandingPage conversation section | Video 2 |
| `AudioWaveform.tsx` | Animated bars from LandingPage audio section | Video 2 |
| `XPPopupAnim.tsx` | Float-up "+10 XP" pill | Videos 1, 2 |
| `AnimatedCounter.tsx` | Spring number counter | Videos 1, 2, 3 |
| `FeaturePills.tsx` | "Offline · Bilaash · Cod" badges | Videos 1, 3 |
| `ArdayBranding.tsx` | EXISTING — logo header + footer | All 3 |

---

## File Structure

```
arday-remotion/src/
├── Promo/
│   ├── TheProblem.tsx            # Video 1 (15s)
│   ├── AppWalkthrough.tsx        # Video 2 (30s)
│   └── WhyArday.tsx              # Video 3 (20s)
├── components/
│   ├── ArdayBranding.tsx         # EXISTING
│   ├── WordCard.tsx              # EXISTING
│   ├── PhoneFrame.tsx            # NEW — phone bezel
│   ├── ProgressBar.tsx           # NEW — lesson progress
│   ├── QuestionView.tsx          # NEW — fill-in-blank question
│   ├── ChatBubble.tsx            # NEW — conversation bubble
│   ├── AudioWaveform.tsx         # NEW — animated bars
│   ├── XPPopupAnim.tsx           # NEW — "+10 XP" float
│   ├── AnimatedCounter.tsx       # NEW — spring number
│   ├── FeaturePills.tsx          # NEW — icon badges
│   ├── DashboardMock.tsx         # NEW — dashboard UI
│   ├── LessonListMock.tsx        # NEW — lesson cards
│   ├── LessonViewMock.tsx        # NEW — active lesson
│   ├── SplitScreen.tsx           # NEW — comparison layout
│   └── ComparisonRow.tsx         # NEW — left vs right
├── Root.tsx                      # UPDATE — register 3 new compositions
├── data/
│   └── words.ts                  # EXISTING
└── WordOfTheDay/                 # EXISTING (unchanged)
```

## Files to modify
| File | Change |
|------|--------|
| `src/Root.tsx` | Add 3 new Composition entries |

## Design tokens to match exactly
- **Background:** `#1c1917`
- **Emerald:** `#10b981` (primary), `#d1fae5` (light), `#059669` (dark)
- **Error red:** `#ef4444`
- **Warning amber:** `#f59e0b`
- **Neutrals:** `#fafaf9` (white-ish), `#e7e5e4` (border), `#a8a29e` (grey text), `#78716c` (secondary), `#1c1917` (dark)
- **Somali text color:** `#8B7355`
- **Font:** Plus Jakarta Sans
- **Shadows:** Two-layer system (ambient + diffuse)
- **Border radius:** 6px (sm), 10px (md), 14px (lg), 9999px (pill)
- **CTA button:** emerald bg, white text, shadow with emerald tint, scale 0.97 on press

## Audio
- `public/music/bg-loop.mp3` — background music at 15% volume in all 3
- `public/audio/vocabulary/good-morning.mp3` — plays during audio feature demo in Video 2

## Rendering
```bash
cd ~/Documents/GitHub/arday-remotion

npx remotion render PromoTheProblem out/promo-the-problem.mp4
npx remotion render PromoWalkthrough out/promo-walkthrough.mp4
npx remotion render PromoWhyArday out/promo-why-arday.mp4
```

## Verification
1. `npx remotion preview src/index.ts` — all compositions visible
2. Render each video individually
3. Check durations: 15s, 30s, 20s
4. Compare Remotion UI mockups against actual app screenshots — colors, fonts, spacing should match
5. Verify bottom 200px safe zone (no content in TikTok/Reels UI overlay area)
6. Verify bg-loop.mp3 plays, vocabulary audio plays in Video 2
7. Check Somali text spelling accuracy
8. Test on phone — do the mockup UIs look like the real app?
