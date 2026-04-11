// Loading skeleton — shimmer-style placeholder matching the Insights page
// layout. Shown while the dashboard is fetching the initial snapshot.
// Shimmer animation is CSS-only (defined in index.css).

export function Skeleton(): JSX.Element {
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <SkeletonBar widthClass="w-24" heightClass="h-3" className="mb-2" />
        <SkeletonBar widthClass="w-80" heightClass="h-8" className="mb-2" />
        <SkeletonBar widthClass="w-[32rem]" heightClass="h-4" />
      </header>

      {/* Stat cards row */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-axis-border bg-axis-surface p-5"
          >
            <SkeletonBar widthClass="w-32" heightClass="h-3" className="mb-3" />
            <SkeletonBar widthClass="w-24" heightClass="h-8" className="mb-2" />
            <SkeletonBar widthClass="w-20" heightClass="h-3" />
          </div>
        ))}
      </div>

      {/* Filter chips row */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonBar
            key={i}
            widthClass="w-20"
            heightClass="h-6"
            className="rounded-md"
          />
        ))}
      </div>

      {/* Insight cards */}
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-axis-border bg-axis-surface p-5"
          >
            <div className="flex items-start gap-4">
              <SkeletonBar widthClass="w-6" heightClass="h-8" />
              <div className="flex-1">
                <SkeletonBar
                  widthClass="w-[70%]"
                  heightClass="h-4"
                  className="mb-2"
                />
                <div className="mt-2 flex gap-2">
                  <SkeletonBar widthClass="w-20" heightClass="h-4" />
                  <SkeletonBar widthClass="w-16" heightClass="h-4" />
                  <SkeletonBar widthClass="w-28" heightClass="h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonBar({
  widthClass,
  heightClass,
  className = '',
}: {
  widthClass: string;
  heightClass: string;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={`relative overflow-hidden rounded bg-axis-muted ${widthClass} ${heightClass} ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.08) 50%, transparent 100%)',
          animation: 'shimmer 1.8s ease-in-out infinite',
        }}
      />
    </div>
  );
}
