import { notFound } from 'next/navigation';

export default async function ResepSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  await params;
  notFound();
}
