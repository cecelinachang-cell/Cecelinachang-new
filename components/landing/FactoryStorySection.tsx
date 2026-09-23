import Image from 'next/image';

export function FactoryStorySection({ title, paragraphs, note }: { title: string; paragraphs: string[]; note: string }) {
  return (
    <section className="bg-kecap px-4 py-14 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-sambal sm:h-24 sm:w-24">
            <Image
              src="/images/lina-avatar.jpeg"
              alt="Cece Lina Chang"
              fill
              sizes="96px"
              className="object-cover object-top"
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold">Cece Lina Chang</p>
            <p className="text-sm text-white/65">Pemilik pabrik bakso, 1998–2016</p>
          </div>
        </div>
        <h2 className="mb-6 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{title}</h2>
        <div className="space-y-5 text-lg leading-[1.7] text-white/85">
          {paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <p className="mt-8 inline-block rounded-lg bg-mie px-3 py-1.5 font-display font-bold text-kecap">{note}</p>
      </div>
    </section>
  );
}
