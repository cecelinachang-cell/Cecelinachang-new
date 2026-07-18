import { courses as fallbackCourses } from '@/app/data/courses';
import { products as fallbackProducts } from '@/app/data/products';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type CatalogCourse = {
  title: string;
  description: string | null;
  price: string | null;
};

type CatalogProduct = {
  name: string;
  description?: string | null;
  price?: string | null;
  category?: string | null;
};

const supportFacts = `
Brand: Cece Lina Chang menyediakan kursus memasak/baking online, resep gratis, dan peralatan baking.
Kontak: WhatsApp admin +62 812-8425-0718, email halo@cecelinachang.com.
Jam respons WhatsApp: 09.00–17.00.
Lokasi pengiriman toko: Jakarta Barat, Indonesia. Toko hanya melayani pengiriman online.
Cara membeli alat: pengunjung memilih produk lalu admin membantu pemesanan melalui WhatsApp.
Cara mengikuti kelas: pengunjung memilih kelas, mendaftar melalui WhatsApp admin, lalu menerima tautan akses video setelah proses pendaftaran.
Pengiriman luar kota: paket dilindungi bubble wrap tebal dan kardus khusus.
Resep pada halaman Resep dapat diakses gratis.
`;

function formatCourses(courses: CatalogCourse[]) {
  return courses
    .slice(0, 30)
    .map((course) => `- ${course.title} | Harga: ${course.price || 'hubungi admin'} | ${course.description || ''}`)
    .join('\n');
}

function formatProducts(products: CatalogProduct[]) {
  return products
    .slice(0, 30)
    .map((product) => `- ${product.name} (${product.category || 'Peralatan'}) | Harga: ${product.price || 'hubungi admin'} | ${product.description || ''}`)
    .join('\n');
}

export async function getSiteKnowledge() {
  const fallbackCourseKnowledge = formatCourses(
    fallbackCourses.map((course) => ({
      title: course.title,
      description: course.description,
      price: course.price,
    })),
  );
  const fallbackProductKnowledge = formatProducts(fallbackProducts);

  if (!isSupabaseConfigured()) {
    return `${supportFacts}\nKURSUS SAAT INI:\n${fallbackCourseKnowledge}\n\nPRODUK SAAT INI:\n${fallbackProductKnowledge}`;
  }

  try {
    const [{ data: courses }, { data: products }, { data: settings }] = await Promise.all([
      supabase.from('courses').select('title, description, price').order('createdAt', { ascending: false }).limit(30),
      supabase.from('items').select('name, description, price, category').order('createdAt', { ascending: false }).limit(30),
      supabase.from('settings').select('id, title, description').in('id', ['general']),
    ]);

    const general = settings?.find((setting) => setting.id === 'general');
    const siteDescription = general?.description ? `Informasi situs tambahan: ${general.description}\n` : '';
    const courseKnowledge = courses?.length ? formatCourses(courses) : fallbackCourseKnowledge;
    const productKnowledge = products?.length ? formatProducts(products) : fallbackProductKnowledge;

    return `${supportFacts}\n${siteDescription}\nKURSUS SAAT INI:\n${courseKnowledge}\n\nPRODUK SAAT INI:\n${productKnowledge}`;
  } catch (error) {
    console.error('Unable to load chatbot knowledge:', error);
    return `${supportFacts}\nKURSUS SAAT INI:\n${fallbackCourseKnowledge}\n\nPRODUK SAAT INI:\n${fallbackProductKnowledge}`;
  }
}
