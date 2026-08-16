export interface Emirate {
  code: string;
  name: { en: string; fr: string; ar: string };
}

export const EMIRATES: Emirate[] = [
  { code: "AUH", name: { en: "Abu Dhabi", fr: "Abou Dabi", ar: "أبوظبي" } },
  { code: "DXB", name: { en: "Dubai", fr: "Dubaï", ar: "دبي" } },
  { code: "SHJ", name: { en: "Sharjah", fr: "Charjah", ar: "الشارقة" } },
  { code: "AJM", name: { en: "Ajman", fr: "Ajman", ar: "عجمان" } },
  {
    code: "UAQ",
    name: { en: "Umm Al Quwain", fr: "Oumm al Qaïwaïn", ar: "أم القيوين" },
  },
  {
    code: "RAK",
    name: { en: "Ras Al Khaimah", fr: "Ras el Khaïmah", ar: "رأس الخيمة" },
  },
  { code: "FUJ", name: { en: "Fujairah", fr: "Fujairah", ar: "الفجيرة" } },
];
