/** A single verbatim student quote, shown right above the quiz. */
export function QuizQuote({ text, source }: { text: string; source: string }) {
  return (
    <figure className="px-4 pb-10 sm:px-6">
      <div className="mx-auto max-w-3xl border-l-4 border-sambal pl-5">
        <blockquote className="font-display text-2xl font-bold leading-snug">“{text}”</blockquote>
        <figcaption className="mt-2 text-sm text-steel">{source}</figcaption>
      </div>
    </figure>
  );
}
