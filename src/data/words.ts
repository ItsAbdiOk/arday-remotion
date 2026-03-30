export interface WordEntry {
  en: string;
  so: string;
  type: "noun" | "verb" | "adjective" | "adverb" | "preposition" | "phrase";
  sentenceEn: string;
  sentenceSo: string;
}

export const words: WordEntry[] = [
  { en: "HELLO", so: "Salaan", type: "noun", sentenceEn: "Hello, how are you?", sentenceSo: "Salaan, sidee tahay?" },
  { en: "THANK YOU", so: "Mahadsanid", type: "phrase", sentenceEn: "Thank you very much.", sentenceSo: "Mahadsanid aad badan." },
  { en: "PLEASE", so: "Fadlan", type: "adverb", sentenceEn: "Can I have water, please?", sentenceSo: "Ma heli karaa biyo, fadlan?" },
  { en: "GOODBYE", so: "Nabad gelyo", type: "phrase", sentenceEn: "Goodbye, see you tomorrow.", sentenceSo: "Nabad gelyo, berri ku aragno." },
  { en: "NAME", so: "Magac", type: "noun", sentenceEn: "My name is Ahmed.", sentenceSo: "Magacaygu waa Ahmed." },
  { en: "WATER", so: "Biyo", type: "noun", sentenceEn: "I drink water every day.", sentenceSo: "Maalin walba biyo baan cabtaa." },
  { en: "COFFEE", so: "Qahwo", type: "noun", sentenceEn: "Can I have a coffee, please?", sentenceSo: "Ma heli karaa qahwo, fadlan?" },
  { en: "TEA", so: "Shaah", type: "noun", sentenceEn: "Would you like tea or juice?", sentenceSo: "Ma rabtaa shaah mise casiir?" },
  { en: "BREAD", so: "Rooti", type: "noun", sentenceEn: "For breakfast, I have bread and eggs.", sentenceSo: "Quraacda, waxaan cunaa rooti iyo ukun." },
  { en: "CHICKEN", so: "Digaag", type: "noun", sentenceEn: "I'd like a chicken sandwich.", sentenceSo: "Waxaan jeclaan lahaa sandwich digaag." },
  { en: "FISH", so: "Kalluun", type: "noun", sentenceEn: "I eat fish and rice.", sentenceSo: "Waxaan cunaa kalluun iyo bariis." },
  { en: "TIME", so: "Waqti", type: "noun", sentenceEn: "What time is it?", sentenceSo: "Saacaddu waa imisa?" },
  { en: "WAKE UP", so: "Tooso", type: "verb", sentenceEn: "I wake up at six o'clock.", sentenceSo: "Saacadda lixda ayaan kacaa." },
  { en: "BED", so: "Jiifso", type: "noun", sentenceEn: "I go to bed at eleven.", sentenceSo: "Saacadda kow iyo tobnaad ayaan jiifaa." },
  { en: "LUNCH", so: "Qado", type: "noun", sentenceEn: "I have lunch at one o'clock.", sentenceSo: "Saacadda kowaad ayaan qado cunaa." },
  { en: "SHIRT", so: "Shaadh", type: "noun", sentenceEn: "Can I try on this shirt?", sentenceSo: "Shaadhan ma isku tijaabi karaa?" },
  { en: "SHOES", so: "Kabo", type: "noun", sentenceEn: "How much are these shoes?", sentenceSo: "Imisa ayaa kabahani yihiin?" },
  { en: "JACKET", so: "Jaakad", type: "noun", sentenceEn: "It's cold. I need my jacket.", sentenceSo: "Way qabow tahay. Waxaan u baahanahay jaakad." },
  { en: "DRESS", so: "Toob", type: "noun", sentenceEn: "She is wearing a beautiful dress.", sentenceSo: "Waxay xidhan tahay toob qurux badan." },
  { en: "UNDER", so: "Hoostiisa", type: "preposition", sentenceEn: "The cat is under the table.", sentenceSo: "Bisaddu waxay ku jirtaa miiska hoostiisa." },
  { en: "ON", so: "Dushiisa", type: "preposition", sentenceEn: "The keys are on the table.", sentenceSo: "Furayaashu waxay saaran yihiin miiska dushiisa." },
  { en: "NEXT TO", so: "Agtiisa", type: "preposition", sentenceEn: "The bank is next to the school.", sentenceSo: "Bangiga wuxuu ku yaalaa iskuulka agtiisa." },
  { en: "BETWEEN", so: "Dhexda", type: "preposition", sentenceEn: "The shop is between the bank and school.", sentenceSo: "Dukaanku wuxuu ku yaalaa bangiga iyo iskuulka dhexdooda." },
  { en: "TURN LEFT", so: "Bidix u leexo", type: "phrase", sentenceEn: "Turn left at the corner.", sentenceSo: "Bidix u leexo geeska." },
  { en: "TURN RIGHT", so: "Midig u leexo", type: "phrase", sentenceEn: "Turn right at the traffic lights.", sentenceSo: "Nalka taraafikada midig u leexo." },
  { en: "GO STRAIGHT", so: "Toos u soco", type: "phrase", sentenceEn: "Go straight for two minutes.", sentenceSo: "Laba daqiiqo toos u soco." },
  { en: "BIG", so: "Weyn", type: "adjective", sentenceEn: "The car is big.", sentenceSo: "Baabuurku waa weyn." },
  { en: "SMALL", so: "Yar", type: "adjective", sentenceEn: "The house is small.", sentenceSo: "Guriga waa yar." },
  { en: "HOT", so: "Kulayl", type: "adjective", sentenceEn: "The coffee is very hot.", sentenceSo: "Qahwuhu aad buu u kulul yahay." },
  { en: "COLD", so: "Qabow", type: "adjective", sentenceEn: "It's cold today.", sentenceSo: "Maanta way qabow tahay." },
];

export function getSlug(en: string): string {
  return en
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
