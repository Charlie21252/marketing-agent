export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-7 bg-gray-800 rounded w-48" />
            <div className="h-4 bg-gray-800 rounded w-64" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-3 w-20 h-16" />
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg h-20 animate-pulse" />
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-900 rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-900/50 rounded border-b border-gray-800" />
          ))}
        </div>
      </div>
    </div>
  )
}
