export default function HistoryLoading() {
  return (
    <div className="px-4 pt-12 pb-4 animate-pulse">
      <div className="mx-auto mb-6 h-8 w-32 rounded-lg bg-card" />

      <div className="mb-8 rounded-2xl bg-card p-4 border border-card-border">
        <div className="mx-auto mb-4 h-5 w-36 rounded bg-card-border" />
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 rounded bg-card-border" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-[168px] rounded-2xl border border-card-border bg-card"
          />
        ))}
      </div>

      <div className="h-4 w-28 rounded bg-card mb-3" />
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-2xl border border-card-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
