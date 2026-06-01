import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const updates = [
  {
    id: "meat-pie",
    benefits: [
      "Teknik membuat kulit pie shortcrust yang renyah, flaky, dan tidak remuk saat dipegang",
      "Cara memasak isian daging sapi agar juicy, tidak alot, dan rasanya meresap sempurna",
      "Teknik membuat saus demi-glace rumahan tanpa peralatan profesional — hasilnya seperti restoran",
      "Cara merakit dan menutup pie agar tidak bocor dan bentuknya rapi saat dipanggang",
      "Teknik memanggang dengan suhu dan waktu yang tepat agar hasilnya golden brown sempurna",
    ],
  },
  {
    id: "ogura-softcake",
    benefits: [
      "Teknik dasar membuat adonan ogura agar teksturnya ringan seperti kapas dan lumer di mulut",
      "Cara menggabungkan rasa matcha, cokelat, dan durian ke dalam adonan tanpa merusak tekstur",
      "Rahasia memanggang ogura agar bagian atas tidak retak dan bagian tengah tidak bantat",
      "Cara mengukur bahan dengan tepat untuk ketiga varian agar hasilnya konsisten setiap kali",
      "Teknik mengeluarkan ogura dari loyang tanpa rusak untuk tampilan yang cantik dan rapi",
    ],
  },
  {
    id: "mocha-pandan-sponge",
    benefits: [
      "Teknik mengocok telur dan gula hingga ribbon stage — rahasia sponge yang mengembang sempurna",
      "Cara melipat tepung ke dalam adonan agar kue tidak turun (deflate) dan tetap fluffy",
      "Rahasia mendapatkan warna dan aroma pandan asli yang kuat, natural, dan tidak artifisial",
      "Teknik memanggang sponge anti-bantat menggunakan oven rumahan biasa tanpa oven profesional",
      "Cara memadukan layer mocha dan pandan agar kedua rasa seimbang dan tidak saling mendominasi",
    ],
  },
  {
    id: "go-hiong-roll",
    benefits: [
      "Teknik meracik bumbu ngohiong otentik dengan takaran pas — tidak terlalu kuat, tidak kurang",
      "Cara menguleni dan mencampur daging agar isian tetap juicy dan tidak kering setelah dimasak",
      "Teknik menggulung rolade agar rapat, tidak mudah lepas, dan bentuk tetap cantik saat dipotong",
      "Cara menggoreng go hiong agar kulitnya krispi merata tanpa terlalu berminyak",
      "Tips menyimpan dan memanaskan kembali go hiong agar kulitnya tetap renyah",
    ],
  },
  {
    id: "fu-kian",
    benefits: [
      "Cara membuat adonan bakso ikan yang kenyal, padat, dan bebas bau amis",
      "Teknik membungkus isian dengan kulit tahu agar tidak robek saat dikukus maupun digoreng",
      "Cara memilih dan menyiapkan kulit tahu berkualitas yang menghasilkan tekstur terbaik",
      "Teknik memasak fu kian — kukus dan goreng — agar tekstur kenyal sempurna dan tidak keras",
      "Tips mengemas fu kian sebagai produk frozen untuk dijual dari rumah dengan harga yang menguntungkan",
    ],
  },
];

async function run() {
  for (const item of updates) {
    const { error } = await supabase
      .from("courses")
      .update({ benefits: item.benefits })
      .eq("slug", item.id);
    if (error) {
      console.error(`Error updating ${item.id}:`, error.message);
    } else {
      console.log(`Successfully updated ${item.id} benefits list.`);
    }
  }
}

run();
