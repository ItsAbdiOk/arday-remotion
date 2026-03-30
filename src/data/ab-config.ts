/**
 * A/B Testing Configuration
 *
 * The test queue defines experiments to run sequentially.
 * ab-optimize.ts advances through this queue automatically
 * based on statistical significance.
 */

export interface TestVariant {
  id: string;
  label: string;
}

export interface TestDefinition {
  name: string;
  variants: TestVariant[];
  metric: "clicks" | "reach" | "engagement";
  minDays: number;
  maxDays: number;
}

export interface ActiveTest {
  testIndex: number;
  startDate: string; // ISO date
  lockedWinner: string | null; // variant ID if test is concluded
}

export const testQueue: TestDefinition[] = [
  {
    name: "caption-style",
    variants: [
      { id: "A", label: "Short caption" },
      { id: "B", label: "Long caption with app pitch" },
    ],
    metric: "clicks",
    minDays: 30,
    maxDays: 45,
  },
  {
    name: "posting-time",
    variants: [
      { id: "8am", label: "8am UTC" },
      { id: "6pm", label: "6pm UTC" },
    ],
    metric: "reach",
    minDays: 30,
    maxDays: 45,
  },
  {
    name: "hashtag-set",
    variants: [
      { id: "somali", label: "Somali hashtags" },
      { id: "english", label: "English hashtags" },
      { id: "mixed", label: "Mixed hashtags" },
    ],
    metric: "reach",
    minDays: 30,
    maxDays: 45,
  },
  {
    name: "format-preference",
    variants: [
      { id: "reel-in-feed", label: "Reel as main feed post" },
      { id: "still-in-feed", label: "Still image as main feed post" },
    ],
    metric: "reach",
    minDays: 30,
    maxDays: 45,
  },
  {
    name: "cta-vs-value",
    variants: [
      { id: "with-cta", label: "Caption with CTA" },
      { id: "no-cta", label: "Caption without CTA (value only)" },
    ],
    metric: "engagement",
    minDays: 30,
    maxDays: 45,
  },
];

// Current state — updated by ab-optimize.ts
export const activeTest: ActiveTest = {
  testIndex: 0,
  startDate: "2026-03-31",
  lockedWinner: null,
};

/**
 * Pick the variant for today based on the active test.
 * For 2-variant tests: alternates daily (dayOfYear % 2).
 * For 3-variant tests: rotates (dayOfYear % 3).
 */
export function pickVariant(dayOfYear: number): TestVariant {
  const test = testQueue[activeTest.testIndex];
  if (!test) return { id: "A", label: "default" };

  // If a winner is locked, always use it
  if (activeTest.lockedWinner) {
    return test.variants.find((v) => v.id === activeTest.lockedWinner) || test.variants[0];
  }

  const idx = dayOfYear % test.variants.length;
  return test.variants[idx];
}

/**
 * Get the scheduled publish time for posting-time test.
 * Returns a Unix timestamp for the Meta API's scheduled_publish_time,
 * or null if not in a posting-time test or no delay needed.
 */
export function getScheduledPublishTime(variant: TestVariant): number | null {
  const test = testQueue[activeTest.testIndex];
  if (test?.name !== "posting-time") return null;

  if (variant.id === "6pm") {
    // Schedule for 6pm UTC today
    const now = new Date();
    const target = new Date(now);
    target.setUTCHours(18, 0, 0, 0);
    // If 6pm already passed today, schedule for tomorrow
    if (target.getTime() <= now.getTime()) {
      target.setUTCDate(target.getUTCDate() + 1);
    }
    return Math.floor(target.getTime() / 1000);
  }

  // 8am variant — post immediately (the Action already runs at 8am)
  return null;
}
