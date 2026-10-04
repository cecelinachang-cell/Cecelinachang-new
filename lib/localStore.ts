import { SITE_URL, WHATSAPP_NUMBER } from '@/lib/links';
import { normalizeCategory } from '@/lib/categories';
import { parseIdr } from '@/lib/pixels';
import { productBrand, productPublicPath } from '@/lib/productSlug';
import type { Product } from '@/lib/products';

/**
 * From the Google listing "CeceLinaChang Store".
 * Weekday close times are not on the public card, so only Saturday and Sunday are stated.
 * Maps: https://www.google.com/maps?cid=209997891204485704
 */
export const STORE = {
  name: 'CeceLinaChang Store',
  brand: 'Cece Lina Chang',
  city: 'Kota Tangerang',
  locality: 'Kota Tangerang',
  region: 'Banten',
  postalCode: '15117',
  country: 'ID',
  street: 'Jl. Pulau Dewa I No.26, RT.005/RW.002, Klp. Indah, Kec. Tangerang',
  addressLine: 'Jl. Pulau Dewa I No.26, RT.005/RW.002, Klp. Indah, Kec. Tangerang, Kota Tangerang, Banten 15117',
  phoneDisplay: '0812-8425-0718',
  telephone: `+${WHATSAPP_NUMBER}`,
  mapsUrl: 'https://www.google.com/maps?cid=209997891204485704',
  latitude: -6.2041361,
  longitude: 106.6371555,
  id: `${SITE_URL}/#toko-tangerang`,
  instagram: 'https://instagram.com/cecelinachang',
  tiktok: 'https://tiktok.com/@lina_chang2',
} as const;

export function storePostalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: STORE.street,
    addressLocality: STORE.locality,
    addressRegion: STORE.region,
    postalCode: STORE.postalCode,
    addressCountry: STORE.country,
  };
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export function productsInCategories(products: Product[], categories: string[]): Product[] {
  const wanted = new Set(categories.map((category) => category.toLowerCase()));
  return products.filter((product) => wanted.has(normalizeCategory(product.category).toLowerCase()));
}

export function findProductByName(products: Product[], needle: string): Product | undefined {
  const query = needle.toLowerCase();
  return products.find((product) => product.name.toLowerCase().includes(query));
}

type Crumb = { name: string; path: string };

type Faq = { q: string; a: string };

export function localPageJsonLd({
  path,
  title,
  description,
  crumbs,
  faqs,
  products,
}: {
  path: string;
  title: string;
  description: string;
  crumbs: Crumb[];
  faqs: Faq[];
  products?: Product[];
}) {
  const pageUrl = absoluteUrl(path);
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Store',
      '@id': STORE.id,
      name: STORE.name,
      url: absoluteUrl('/toko'),
      image: absoluteUrl('/icon-192.png'),
      telephone: STORE.telephone,
      address: storePostalAddress(),
      hasMap: STORE.mapsUrl,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: STORE.latitude,
        longitude: STORE.longitude,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '10:00',
          closes: '13:30',
        },
      ],
      areaServed: { '@type': 'City', name: 'Tangerang' },
      currenciesAccepted: 'IDR',
      paymentAccepted: 'Transfer bank',
      sameAs: [STORE.instagram, STORE.tiktok],
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: 'id-ID',
      about: { '@id': STORE.id },
      isPartOf: { '@type': 'WebSite', name: STORE.brand, url: SITE_URL },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
  ];

  if (products && products.length > 0) {
    graph.push({
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => {
        const price = parseIdr(product.price);
        const path = productPublicPath(product);
        const brand = productBrand(product);
        return {
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(path),
          name: product.name,
          item: {
            '@type': 'Product',
            name: product.name,
            ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
            url: absoluteUrl(path),
            ...(price
              ? {
                  offers: {
                    '@type': 'Offer',
                    priceCurrency: 'IDR',
                    price,
                    availability: 'https://schema.org/InStock',
                    url: absoluteUrl(path),
                  },
                }
              : {}),
          },
        };
      }),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
