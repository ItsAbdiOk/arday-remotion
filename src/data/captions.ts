import type { WordEntry } from "./words";

export type CaptionStyle = "A" | "B";

export function pickCaptionStyle(dayOfYear: number): CaptionStyle {
  return dayOfYear % 2 === 0 ? "A" : "B";
}

export function buildCaption(word: WordEntry, style: CaptionStyle): string {
  const utm = style === "A" ? "short" : "long";
  const url = `arday-nine.vercel.app?utm_source=social&utm_campaign=wotd&utm_content=${utm}`;

  if (style === "A") {
    return [
      `\ud83d\udcda Erayga Maanta — Word of the Day`,
      `\ud83c\uddec\ud83c\udde7 ${word.en}`,
      `\ud83c\uddf8\ud83c\uddf4 ${word.so}`,
      `"${word.sentenceEn}"`,
      `"${word.sentenceSo}"`,
      ``,
      `Baro 500+ erayg bilaash ah \ud83d\udc49 ${url}`,
      ``,
      `#Arday #BaroIngiriisiga #WordOfTheDay #Somali #LearnEnglish`,
    ].join("\n");
  }

  return [
    `\ud83d\udcda Erayga Maanta — Word of the Day`,
    `\ud83c\uddec\ud83c\udde7 ${word.en}`,
    `\ud83c\uddf8\ud83c\uddf4 ${word.so}`,
    `"${word.sentenceEn}"`,
    `"${word.sentenceSo}"`,
    ``,
    `Ma rabtaa inaad barto Ingiriisiga af-Soomaali? Arday waa app bilaash ah — 120 cashar, cod, internet la'aan ka shaqeysa.`,
    `\ud83d\udc49 ${url}`,
    ``,
    `#Arday #BaroIngiriisiga #WordOfTheDay #Somali #LearnEnglish`,
  ].join("\n");
}
