import type {Metadata, Viewport} from 'next';
import Script from 'next/script';
import { Inter, Fraunces, Caveat } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ChatbotWidget } from '@/components/chatbot-widget';
import { SearchOverlay } from '@/components/SearchOverlay';
import { AuthProvider } from '@/context/AuthContext';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MetaPixel from '@/components/MetaPixel';
import { supabase } from '@/lib/supabase';
import { META_PIXEL_ID } from '@/lib/meta-pixel';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['500', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#C4622D',
};

export async function generateMetadata(): Promise<Metadata> {
  let title = 'Cece Lina Chang | Belajar Baking dari Rumah';
  let description = 'Belajar baking dari rumah dengan mudah untuk pemula. Temukan alat masak premium dan kursus baking online bersama Cece Lina Chang.';
  let ogImage = DEFAULT_OG_IMAGE;

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
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || '';
    if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
      console.error('Error fetching metadata settings:', error);
    }
  }

  return {
    // Makes every relative URL in metadata (OG images, canonicals) resolve to
    // an absolute one, which is what crawlers and social scrapers require.
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      // Child pages set only their own name; the brand suffix is appended here
      // so titles stay unique without every page repeating the boilerplate.
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    keywords: ['baking for beginners', 'belajar baking dari rumah', 'kursus baking online', 'alat baking premium', 'resep kue', 'Cece Lina Chang'],
    formatDetection: { telephone: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Let Google use full-size image previews and longer text snippets.
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
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
    icons: {
      // Google picks the search-result favicon from these. It wants a square
      // that is a multiple of 48px, so /icon-48.png and /icon-96.png exist
      // purely for the crawler; browsers keep using the .ico and the big PNGs.
      icon: [
        { url: '/favicon.ico', sizes: '16x16 32x32 48x48 96x96' },
        { url: '/icon-48.png', type: 'image/png', sizes: '48x48' },
        { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
        { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
        { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// Site-wide structured data. Kept as a @graph so the Organization and the
// WebSite reference each other by @id instead of being duplicated per page.
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      description:
        'Belajar baking dari rumah dengan mudah untuk pemula. Kursus baking online dan alat baking premium.',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/icon.png'),
        width: 512,
        height: 512,
      },
      image: DEFAULT_OG_IMAGE,
      email: 'halo@cecelinachang.com',
      areaServed: 'ID',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          telephone: '+6281284250718',
          availableLanguage: ['id'],
        },
      ],
      sameAs: [
        'https://instagram.com/cecelinachang',
        'https://tiktok.com/@lina_chang2',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${inter.variable} ${fraunces.variable} ${caveat.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');if(location.pathname.indexOf('/admin')!==0)fbq('track','PageView');`}
        </Script>
      </head>
      <body className="font-sans bg-cream text-charcoal-brown min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <AnalyticsTracker />
          <MetaPixel />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ChatbotWidget />
          <SearchOverlay />
        </AuthProvider>
      </body>
    </html>
  );
}
