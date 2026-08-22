// Loading placeholders mirror the real layout so nothing jumps when data lands.

export function SkeletonGrid(props: { count?: number }) {
  const { count = 12 } = props;
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]"
    >
      {Array.from({ length: count }, (_, i) => `sk-${i}`).map((id) => (
        <div key={id} className="overflow-hidden rounded-lg bg-surface">
          <div className="shimmer aspect-square" />
          <div className="space-y-2 p-3">
            <div className="shimmer h-2.5 w-3/4 rounded-xs" />
            <div className="shimmer h-2.5 w-1/3 rounded-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows(props: { count?: number }) {
  const { count = 10 } = props;
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-lg bg-surface">
      {Array.from({ length: count }, (_, i) => `sr-${i}`).map((id) => (
        <div
          key={id}
          className="flex items-center gap-3 border-b border-hairline px-3 py-2.5 last:border-b-0"
        >
          <div className="shimmer h-4 w-4 rounded-xs" />
          <div className="shimmer h-7 w-7 rounded-sm" />
          <div className="shimmer h-2.5 flex-1 rounded-xs" />
          <div className="shimmer h-2.5 w-16 rounded-xs" />
          <div className="shimmer h-2.5 w-28 rounded-xs" />
        </div>
      ))}
    </div>
  );
}
