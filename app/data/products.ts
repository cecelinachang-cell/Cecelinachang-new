export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  isBundle?: boolean;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const products: Product[] = [
  {
    id: "signora-de-amore",
    name: "Signora Oven De Amore - 38L",
    price: "Rp 1.980.000",
    originalPrice: "Rp 2.200.000",
    category: "Oven",
    rating: 4.9,
    reviews: 142,
    imageUrl: "https://i.postimg.cc/rmKx8jyp/LAPISLEGITPHOTO.png",
    description: "Oven De Amore Signora hadir dengan warna rose gold yang sangat elegan. Dilengkapi dengan fungsi convection (kipas blower), rotisserie untuk memanggang ayam utuh, dan pengatur suhu independen untuk api atas dan api bawah. Memanggang Lapis Legit kini lebih mudah dengan hasil matang yang merata sempurna."
  },
  {
    id: "signora-la-mer",
    name: "Signora Stand Mixer La Mer - 5L",
    price: "Rp 3.580.000",
    originalPrice: "Rp 3.900.000",
    category: "Mixer",
    rating: 5.0,
    reviews: 89,
    imageUrl: "https://i.postimg.cc/t10xCGvR/image.png",
    description: "Mixer premium dengan motor berkekuatan tinggi hingga 1200 Watt dan mangkuk stainless steel tebal berkapasitas 5 Liter. Ideal untuk adonan roti, donat, dan sangat andal dalam mengocok telur hngga mengembang kaku untuk adonan bolu lapis maupun sponge cake klasik tanpa cepat panas."
  },
  {
    id: "loyang-lapis-legit",
    name: "Loyang Lapis Legit Aluminium Tebal 20x20",
    price: "Rp 185.000",
    originalPrice: "Rp 210.000",
    category: "Loyang",
    rating: 4.8,
    reviews: 215,
    imageUrl: "https://i.postimg.cc/ppmR9mmT/MEATPIEPHOTO.png",
    description: "Loyang baking tebal premium ukuran presisi 20 x 20 x 8 cm berbahan aluminium berkualitas tinggi yang dirancang khusus untuk distribusi panas merata dan hasil sisi lapis legit yang mulus, rapi, dan tidak bergelombang."
  },
  {
    id: "signora-galaxy",
    name: "Signora Hand Mixer Galaxy",
    price: "Rp 880.000",
    originalPrice: "Rp 980.000",
    category: "Mixer",
    rating: 4.9,
    reviews: 167,
    imageUrl: "https://i.postimg.cc/tnCGLZ9S/Chat-GPT-Image-Mar-17-2026-04-58-17-PM.png",
    description: "Hand mixer andalan dengan 5 kecepatan dan tombol Turbo yang tangguh. Ringan digenggam dan tidak menimbulkan bising. Sangat cocok untuk mengocok margarin atau whipping cream dalam porsi harian rumah tangga."
  }
];
