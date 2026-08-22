export default function SkeletonGrid() {
  return (
    <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
      {Array.from({ length: 8 }, (_, i) => `sk-${i}`).map((id) => (
        <div
          key={id}
          className="animate-pulse overflow-hidden rounded-none border border-line bg-panel"
        >
          <div className="aspect-square bg-panel-2" />
          <div className="space-y-2 border-t border-line p-3">
            <div className="h-2.5 w-3/4 rounded bg-panel-2" />
            <div className="h-2.5 w-1/3 rounded bg-panel-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
