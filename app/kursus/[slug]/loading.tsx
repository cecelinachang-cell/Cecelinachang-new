export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="w-48 h-6 bg-stone-200 rounded mb-8"></div>
      <div className="mb-16">
        <div className="w-32 h-8 bg-stone-200 rounded-full mb-4"></div>
        <div className="w-3/4 h-12 bg-stone-200 rounded-lg mb-6"></div>
        <div className="flex gap-6 mb-8">
          <div className="w-32 h-6 bg-stone-200 rounded"></div>
          <div className="w-32 h-6 bg-stone-200 rounded"></div>
          <div className="w-32 h-6 bg-stone-200 rounded"></div>
        </div>
        <div className="h-64 sm:h-96 lg:h-[500px] bg-stone-200 rounded-3xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-4">
            <div className="w-48 h-8 bg-stone-200 rounded"></div>
            <div className="w-full h-4 bg-stone-200 rounded"></div>
            <div className="w-full h-4 bg-stone-200 rounded"></div>
            <div className="w-3/4 h-4 bg-stone-200 rounded"></div>
          </div>
          <div className="h-64 bg-stone-200 rounded-3xl"></div>
        </div>
        <div className="lg:col-span-1">
          <div className="h-96 bg-stone-200 rounded-3xl sticky top-24"></div>
        </div>
      </div>
    </div>
  );
}
