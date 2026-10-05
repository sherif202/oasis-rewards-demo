export interface Product {
  id: string;
  en: string;
  ar: string;
  price: number;
  emoji: string;
}

export const products: Product[] = [
  { id: "water", en: "Al Ain water 12×1.5L", ar: "مياه العين ١٢×١٫٥ لتر", price: 15, emoji: "💧" },
  { id: "pampers", en: "Pampers diapers size 4", ar: "حفاضات بامبرز مقاس ٤", price: 69, emoji: "👶" },
  { id: "rice", en: "Basmati rice 5kg", ar: "أرز بسمتي ٥ كجم", price: 32, emoji: "🍚" },
  { id: "milk", en: "Al Rawabi milk 2L", ar: "حليب الروابي ٢ لتر", price: 11, emoji: "🥛" },
  { id: "eggs", en: "Eggs, 30 pack", ar: "بيض ٣٠ حبة", price: 22, emoji: "🥚" },
  { id: "bread", en: "Arabic bread", ar: "خبز عربي", price: 4, emoji: "🫓" },
  { id: "dates", en: "Dates 1kg", ar: "تمر ١ كجم", price: 35, emoji: "🌴" },
  { id: "laban", en: "Laban", ar: "لبن", price: 6, emoji: "🥤" },
  { id: "oil", en: "Olive oil 1L", ar: "زيت زيتون ١ لتر", price: 28, emoji: "🫒" },
  { id: "chicken", en: "Chicken 1kg", ar: "دجاج ١ كجم", price: 26, emoji: "🍗" },
  { id: "tissues", en: "Tissues 5-pack", ar: "مناديل ٥ علب", price: 18, emoji: "🧻" },
  { id: "detergent", en: "Laundry detergent", ar: "منظف غسيل", price: 39, emoji: "🧺" },
  { id: "bananas", en: "Bananas 1kg", ar: "موز ١ كجم", price: 7, emoji: "🍌" },
  { id: "tomatoes", en: "Tomatoes 1kg", ar: "طماطم ١ كجم", price: 6, emoji: "🍅" },
  { id: "vimto", en: "Vimto concentrate", ar: "فيمتو مركز", price: 14, emoji: "🍇" },
];

export const productById = (id: string) => products.find((p) => p.id === id)!;
