/**
 * One-time script to extract vocabulary pairs from SomLearn lesson files
 * and expand src/data/words.ts.
 *
 * Usage: npx ts-node scripts/extract-words.ts
 */

import fs from "fs";
import path from "path";

const LESSONS_DIR = path.resolve(__dirname, "../../SomLearn/src/content/lessons");
const OUTPUT = path.resolve(__dirname, "../src/data/words.ts");

interface LessonPair {
  en: string;
  so: string;
}

interface Lesson {
  id: string;
  title: { en: string; so: string };
  level: number;
  questions: Array<{
    type: string;
    pairs?: LessonPair[];
    options?: Array<{ en: string; so: string; correct?: boolean }>;
    prompt?: { en: string; so: string };
    answer?: string;
  }>;
}

// Classify word type from English text
function classifyType(en: string): string {
  const lower = en.toLowerCase();

  // Phrases (multi-word or common phrases)
  if (
    lower.includes(" ") &&
    !lower.match(/^(very |too |more |most |less )/) &&
    !lower.match(/^(to |a |an |the )/)
  ) {
    // Check if it's a phrasal verb
    const phrasalVerbs = ["wake up", "get up", "turn on", "turn off", "look after",
      "pick up", "put on", "take off", "go out", "come in", "sit down", "stand up",
      "give up", "find out", "turn left", "turn right", "go straight"];
    if (phrasalVerbs.some((pv) => lower === pv)) return "verb";
    return "phrase";
  }

  // Common verbs
  const verbs = [
    "go", "come", "run", "walk", "eat", "drink", "sleep", "wake", "read", "write",
    "speak", "listen", "learn", "teach", "study", "work", "play", "buy", "sell",
    "cook", "clean", "wash", "drive", "fly", "swim", "sing", "dance", "open",
    "close", "start", "stop", "help", "need", "want", "like", "love", "hate",
    "think", "know", "understand", "remember", "forget", "try", "use", "make",
    "take", "give", "put", "get", "have", "do", "say", "tell", "ask", "answer",
    "call", "meet", "wait", "live", "die", "travel", "arrive", "leave", "stay",
    "sit", "stand", "lie", "pay", "cost", "spend", "save", "borrow", "lend",
    "rent", "book", "order", "complain", "apologise", "apologize", "explain",
    "describe", "suggest", "recommend", "agree", "disagree", "argue", "discuss",
    "analyse", "analyze", "evaluate", "compare", "contrast", "define", "identify",
  ];
  if (verbs.includes(lower)) return "verb";

  // Common adjectives
  const adjectives = [
    "big", "small", "hot", "cold", "good", "bad", "happy", "sad", "fast", "slow",
    "old", "new", "young", "tall", "short", "long", "wide", "narrow", "thick",
    "thin", "heavy", "light", "easy", "hard", "difficult", "simple", "beautiful",
    "ugly", "clean", "dirty", "quiet", "loud", "rich", "poor", "cheap", "expensive",
    "free", "busy", "tired", "hungry", "thirsty", "sick", "healthy", "strong",
    "weak", "safe", "dangerous", "important", "interesting", "boring", "exciting",
    "comfortable", "uncomfortable", "possible", "impossible", "necessary",
    "available", "popular", "famous", "significant", "academic", "formal", "informal",
    "polite", "rude", "friendly", "serious", "funny", "correct", "wrong", "true",
    "false", "real", "main", "final", "previous", "next", "early", "late",
  ];
  if (adjectives.includes(lower)) return "adjective";

  // Common adverbs
  const adverbs = [
    "very", "really", "quite", "always", "never", "often", "sometimes", "usually",
    "already", "still", "yet", "just", "also", "too", "enough", "almost",
    "perhaps", "maybe", "probably", "definitely", "certainly", "obviously",
    "quickly", "slowly", "carefully", "easily", "recently", "finally",
    "however", "therefore", "consequently", "furthermore", "moreover",
    "nevertheless", "meanwhile", "afterwards", "immediately",
  ];
  if (adverbs.includes(lower)) return "adverb";

  // Common prepositions
  const prepositions = [
    "in", "on", "at", "to", "from", "with", "without", "for", "about", "between",
    "under", "over", "above", "below", "near", "behind", "beside", "next to",
    "in front of", "opposite", "through", "across", "along", "around",
    "before", "after", "during", "until", "since",
  ];
  if (prepositions.includes(lower)) return "preposition";

  // Default to noun
  return "noun";
}

// Generate a simple example sentence
function generateSentence(en: string, so: string, type: string): { sentenceEn: string; sentenceSo: string } {
  const lower = en.toLowerCase();

  // For phrases, use them directly
  if (type === "phrase") {
    return {
      sentenceEn: `${en}.`,
      sentenceSo: `${so}.`,
    };
  }

  // For verbs
  if (type === "verb") {
    return {
      sentenceEn: `I ${lower} every day.`,
      sentenceSo: `Maalin walba waan ${so.toLowerCase()}.`,
    };
  }

  // For adjectives
  if (type === "adjective") {
    return {
      sentenceEn: `It is very ${lower}.`,
      sentenceSo: `Aad ayay u ${so.toLowerCase()} tahay.`,
    };
  }

  // For adverbs
  if (type === "adverb") {
    return {
      sentenceEn: `She speaks ${lower}.`,
      sentenceSo: `Waxay ku hadalaa ${so.toLowerCase()}.`,
    };
  }

  // For prepositions
  if (type === "preposition") {
    return {
      sentenceEn: `The book is ${lower} the table.`,
      sentenceSo: `Buugu wuxuu ku yaalaa miiska ${so.toLowerCase()}.`,
    };
  }

  // Default (noun)
  const article = /^[aeiou]/i.test(en) ? "an" : "a";
  return {
    sentenceEn: `I need ${article} ${lower}.`,
    sentenceSo: `Waxaan u baahanahay ${so.toLowerCase()}.`,
  };
}

function main() {
  // Read existing words to preserve hand-crafted entries
  const existingFile = fs.readFileSync(OUTPUT, "utf-8");
  const existingMatch = existingFile.match(
    /export const words: WordEntry\[\] = \[([\s\S]*?)\];/
  );

  // Extract existing English words (lowercase) to avoid duplicates
  const existingWords = new Set<string>();
  const existingEntryRegex = /en:\s*"([^"]+)"/g;
  let m;
  while ((m = existingEntryRegex.exec(existingFile)) !== null) {
    existingWords.add(m[1].toLowerCase());
  }
  console.log(`Existing words: ${existingWords.size}`);

  // Read all lesson files
  const files = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith(".json")).sort();
  console.log(`Lesson files: ${files.length}`);

  const newPairs: Map<string, { en: string; so: string }> = new Map();

  for (const file of files) {
    const raw = fs.readFileSync(path.join(LESSONS_DIR, file), "utf-8");
    const lesson: Lesson = JSON.parse(raw);

    for (const q of lesson.questions) {
      // Extract from match-pairs
      if (q.type === "match-pairs" && q.pairs) {
        for (const pair of q.pairs) {
          const key = pair.en.toLowerCase();
          if (!existingWords.has(key) && !newPairs.has(key) && pair.en && pair.so) {
            newPairs.set(key, { en: pair.en, so: pair.so });
          }
        }
      }

      // Extract from multiple-choice options
      if (q.type === "multiple-choice" && q.options) {
        for (const opt of q.options) {
          if (opt.en && opt.so) {
            const key = opt.en.toLowerCase();
            if (!existingWords.has(key) && !newPairs.has(key)) {
              newPairs.set(key, { en: opt.en, so: opt.so });
            }
          }
        }
      }
    }
  }

  console.log(`New unique pairs extracted: ${newPairs.size}`);
  console.log(`Total words (existing + new): ${existingWords.size + newPairs.size}`);

  // Build new entries
  const newEntries: string[] = [];
  for (const [, pair] of newPairs) {
    const type = classifyType(pair.en);
    const { sentenceEn, sentenceSo } = generateSentence(pair.en, pair.so, type);
    const enEscaped = pair.en.replace(/"/g, '\\"');
    const soEscaped = pair.so.replace(/"/g, '\\"');
    const senEnEscaped = sentenceEn.replace(/"/g, '\\"');
    const senSoEscaped = sentenceSo.replace(/"/g, '\\"');

    newEntries.push(
      `  { en: "${enEscaped}", so: "${soEscaped}", type: "${type}", sentenceEn: "${senEnEscaped}", sentenceSo: "${senSoEscaped}" }`
    );
  }

  // Read the existing file and inject new entries before the closing ];
  const closingIndex = existingFile.lastIndexOf("];");
  if (closingIndex === -1) {
    console.error("Could not find closing ]; in words.ts");
    process.exit(1);
  }

  const before = existingFile.substring(0, closingIndex).trimEnd();
  const after = existingFile.substring(closingIndex);

  const updatedFile = before + ",\n" + newEntries.join(",\n") + "\n" + after;

  fs.writeFileSync(OUTPUT, updatedFile, "utf-8");
  console.log(`\nUpdated ${OUTPUT}`);
  console.log(`Total entries: ${existingWords.size + newPairs.size}`);
}

main();
