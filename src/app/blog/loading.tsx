export default function BlogLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-16 text-center">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-3"></div>
        <div className="h-6 w-full max-w-2xl bg-gray-200 rounded animate-pulse mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
            <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 