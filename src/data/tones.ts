export interface ToneVariant {
  tone: 1 | 2 | 3 | 4;
  pinyin: string;
  hanzi: string;
  gloss: string;
  ttsText: string;
}

export interface ToneSyllable {
  base: string;
  variants: [ToneVariant, ToneVariant, ToneVariant, ToneVariant];
}

export const toneSyllables: ToneSyllable[] = [
  {
    base: "ma",
    variants: [
      { tone: 1, pinyin: "mā", hanzi: "妈", gloss: "mother", ttsText: "妈" },
      { tone: 2, pinyin: "má", hanzi: "麻", gloss: "hemp", ttsText: "麻" },
      { tone: 3, pinyin: "mǎ", hanzi: "马", gloss: "horse", ttsText: "马" },
      { tone: 4, pinyin: "mà", hanzi: "骂", gloss: "to scold", ttsText: "骂" },
    ],
  },
  {
    base: "ba",
    variants: [
      { tone: 1, pinyin: "bā", hanzi: "八", gloss: "eight", ttsText: "八" },
      { tone: 2, pinyin: "bá", hanzi: "拔", gloss: "to pull out", ttsText: "拔" },
      { tone: 3, pinyin: "bǎ", hanzi: "把", gloss: "to hold", ttsText: "把" },
      { tone: 4, pinyin: "bà", hanzi: "爸", gloss: "father", ttsText: "爸" },
    ],
  },
  {
    base: "da",
    variants: [
      { tone: 1, pinyin: "dā", hanzi: "搭", gloss: "to build", ttsText: "搭" },
      { tone: 2, pinyin: "dá", hanzi: "达", gloss: "to reach", ttsText: "达" },
      { tone: 3, pinyin: "dǎ", hanzi: "打", gloss: "to hit", ttsText: "打" },
      { tone: 4, pinyin: "dà", hanzi: "大", gloss: "big", ttsText: "大" },
    ],
  },
  {
    base: "shi",
    variants: [
      { tone: 1, pinyin: "shī", hanzi: "师", gloss: "teacher", ttsText: "师" },
      { tone: 2, pinyin: "shí", hanzi: "十", gloss: "ten", ttsText: "十" },
      { tone: 3, pinyin: "shǐ", hanzi: "史", gloss: "history", ttsText: "史" },
      { tone: 4, pinyin: "shì", hanzi: "是", gloss: "to be", ttsText: "是" },
    ],
  },
  {
    base: "si",
    variants: [
      { tone: 1, pinyin: "sī", hanzi: "丝", gloss: "silk", ttsText: "丝" },
      { tone: 2, pinyin: "sí", hanzi: "死", gloss: "to die (rising)", ttsText: "死" },
      { tone: 3, pinyin: "sǐ", hanzi: "死", gloss: "to die", ttsText: "死" },
      { tone: 4, pinyin: "sì", hanzi: "四", gloss: "four", ttsText: "四" },
    ],
  },
  {
    base: "li",
    variants: [
      { tone: 1, pinyin: "lī", hanzi: "哩", gloss: "mile", ttsText: "哩" },
      { tone: 2, pinyin: "lí", hanzi: "离", gloss: "to leave", ttsText: "离" },
      { tone: 3, pinyin: "lǐ", hanzi: "里", gloss: "inside", ttsText: "里" },
      { tone: 4, pinyin: "lì", hanzi: "力", gloss: "strength", ttsText: "力" },
    ],
  },
  {
    base: "fu",
    variants: [
      { tone: 1, pinyin: "fū", hanzi: "夫", gloss: "husband", ttsText: "夫" },
      { tone: 2, pinyin: "fú", hanzi: "福", gloss: "fortune", ttsText: "福" },
      { tone: 3, pinyin: "fǔ", hanzi: "府", gloss: "mansion", ttsText: "府" },
      { tone: 4, pinyin: "fù", hanzi: "父", gloss: "father", ttsText: "父" },
    ],
  },
  {
    base: "gu",
    variants: [
      { tone: 1, pinyin: "gū", hanzi: "姑", gloss: "aunt", ttsText: "姑" },
      { tone: 2, pinyin: "gú", hanzi: "骨", gloss: "bone (rising)", ttsText: "骨" },
      { tone: 3, pinyin: "gǔ", hanzi: "古", gloss: "ancient", ttsText: "古" },
      { tone: 4, pinyin: "gù", hanzi: "故", gloss: "reason", ttsText: "故" },
    ],
  },
  {
    base: "zhu",
    variants: [
      { tone: 1, pinyin: "zhū", hanzi: "猪", gloss: "pig", ttsText: "猪" },
      { tone: 2, pinyin: "zhú", hanzi: "竹", gloss: "bamboo", ttsText: "竹" },
      { tone: 3, pinyin: "zhǔ", hanzi: "主", gloss: "main", ttsText: "主" },
      { tone: 4, pinyin: "zhù", hanzi: "住", gloss: "to live", ttsText: "住" },
    ],
  },
  {
    base: "chi",
    variants: [
      { tone: 1, pinyin: "chī", hanzi: "吃", gloss: "to eat", ttsText: "吃" },
      { tone: 2, pinyin: "chí", hanzi: "池", gloss: "pool", ttsText: "池" },
      { tone: 3, pinyin: "chǐ", hanzi: "尺", gloss: "ruler", ttsText: "尺" },
      { tone: 4, pinyin: "chì", hanzi: "赤", gloss: "red", ttsText: "赤" },
    ],
  },
  {
    base: "du",
    variants: [
      { tone: 1, pinyin: "dū", hanzi: "都", gloss: "capital", ttsText: "都" },
      { tone: 2, pinyin: "dú", hanzi: "读", gloss: "to read", ttsText: "读" },
      { tone: 3, pinyin: "dǔ", hanzi: "赌", gloss: "to gamble", ttsText: "赌" },
      { tone: 4, pinyin: "dù", hanzi: "度", gloss: "degree", ttsText: "度" },
    ],
  },
  {
    base: "tang",
    variants: [
      { tone: 1, pinyin: "tāng", hanzi: "汤", gloss: "soup", ttsText: "汤" },
      { tone: 2, pinyin: "táng", hanzi: "糖", gloss: "sugar", ttsText: "糖" },
      { tone: 3, pinyin: "tǎng", hanzi: "躺", gloss: "to lie down", ttsText: "躺" },
      { tone: 4, pinyin: "tàng", hanzi: "趟", gloss: "trip", ttsText: "趟" },
    ],
  },
  {
    base: "wen",
    variants: [
      { tone: 1, pinyin: "wēn", hanzi: "温", gloss: "warm", ttsText: "温" },
      { tone: 2, pinyin: "wén", hanzi: "文", gloss: "writing", ttsText: "文" },
      { tone: 3, pinyin: "wěn", hanzi: "稳", gloss: "stable", ttsText: "稳" },
      { tone: 4, pinyin: "wèn", hanzi: "问", gloss: "to ask", ttsText: "问" },
    ],
  },
  {
    base: "kai",
    variants: [
      { tone: 1, pinyin: "kāi", hanzi: "开", gloss: "to open", ttsText: "开" },
      { tone: 2, pinyin: "kái", hanzi: "揩", gloss: "to wipe", ttsText: "揩" },
      { tone: 3, pinyin: "kǎi", hanzi: "凯", gloss: "triumph", ttsText: "凯" },
      { tone: 4, pinyin: "kài", hanzi: "慨", gloss: "generous", ttsText: "慨" },
    ],
  },
  {
    base: "tian",
    variants: [
      { tone: 1, pinyin: "tiān", hanzi: "天", gloss: "sky", ttsText: "天" },
      { tone: 2, pinyin: "tián", hanzi: "甜", gloss: "sweet", ttsText: "甜" },
      { tone: 3, pinyin: "tiǎn", hanzi: "舔", gloss: "to lick", ttsText: "舔" },
      { tone: 4, pinyin: "tiàn", hanzi: "殿", gloss: "hall", ttsText: "殿" },
    ],
  },
];
