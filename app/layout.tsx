import type {Metadata} from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { AuthProvider } from '@/context/AuthContext';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import { supabase } from '@/lib/supabase';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export async function generateMetadata(): Promise<Metadata> {
  let title = 'Cece Lina Chang | Belajar Baking dari Rumah';
  let description = 'Belajar baking dari rumah dengan mudah untuk pemula. Temukan alat masak premium dan kursus baking online bersama Cece Lina Chang.';
  let ogImage = 'https://i.postimg.cc/tCXKbMWY/image.png';

  try {
    const { data: settings } = await supabase.from('settings').select('*').in('id', ['general', 'hero_image']);
    const general = settings?.find(s => s.id === 'general');
    const heroImage = settings?.find(s => s.id === 'hero_image');

    if (general) {
      if (general.title) title = general.title;
      if (general.description) description = general.description;
      // We could use general.logo_url for ogImage, but hero_image is more suitable
    }
    if (heroImage && heroImage.logo_url) {
      ogImage = heroImage.logo_url;
    }
  } catch (error) {
    console.error('Error fetching metadata settings:', error);
  }

  return {
    title,
    description,
    keywords: ['baking for beginners', 'belajar baking dari rumah', 'kursus baking online', 'alat baking premium', 'resep kue', 'Cece Lina Chang'],
    openGraph: {
      title,
      description,
      url: 'https://cecelinachang.com',
      siteName: 'Cece Lina Chang',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Cece Lina Chang Baking',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cece Lina Chang',
  description: 'Belajar baking dari rumah dengan mudah untuk pemula. Kursus baking online dan alat baking premium.',
  url: 'https://cecelinachang.com',
  logo: 'https://i.postimg.cc/tCXKbMWY/image.png',
  sameAs: [
    'https://instagram.com/cecelinachang'
  ]
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-[#FFFBF5] text-stone-800 min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <AnalyticsTracker />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </body>
    </html>
  );
}
