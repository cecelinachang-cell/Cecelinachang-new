export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16 animate-pulse">
        <div className="w-48 h-8 bg-stone-200 rounded-full mx-auto mb-6"></div>
        <div className="w-3/4 h-12 bg-stone-200 rounded-lg mx-auto mb-6"></div>
        <div className="w-1/2 h-6 bg-stone-200 rounded mx-auto"></div>
      </div>
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col lg:flex-row animate-pulse"
          >
            <div className="w-full lg:w-2/5 h-64 lg:h-auto bg-stone-200"></div>
            <div className="p-8 lg:p-10 w-full lg:w-3/5 space-y-6">
              <div className="h-8 bg-stone-200 rounded w-3/4"></div>
              <div className="h-20 bg-stone-200 rounded w-full"></div>
              <div className="flex gap-4">
                <div className="h-8 bg-stone-200 rounded-full w-24"></div>
                <div className="h-8 bg-stone-200 rounded-full w-24"></div>
                <div className="h-8 bg-stone-200 rounded-full w-24"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-6 bg-stone-200 rounded w-full"></div>
                <div className="h-6 bg-stone-200 rounded w-full"></div>
                <div className="h-6 bg-stone-200 rounded w-full"></div>
                <div className="h-6 bg-stone-200 rounded w-full"></div>
              </div>
              <div className="h-12 bg-stone-200 rounded-xl w-48 mt-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
