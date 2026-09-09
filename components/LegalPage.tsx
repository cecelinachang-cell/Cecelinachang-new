interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-3">{title}</h1>
      <p className="text-sm text-charcoal-brown/50 mb-8">Terakhir diperbarui: {updated}</p>
      <p className="text-lg text-charcoal-brown/85 leading-relaxed mb-10">{intro}</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-serif text-2xl font-bold text-rust-ink mb-3">{section.heading}</h2>
            <div className="space-y-4 text-charcoal-brown/80 leading-relaxed">
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
