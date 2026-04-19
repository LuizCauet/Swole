export default function AccountLoading() {
  return (
    <div className="px-6 pt-12 pb-4 animate-pulse">
      <div className="mx-auto mb-8 h-8 w-28 rounded-lg bg-card" />

      <div className="mb-8 rounded-2xl border border-card-border bg-card p-4">
        <div className="h-3 w-20 rounded bg-card-border mb-2" />
        <div className="h-4 w-48 rounded bg-card-border" />
      </div>

      <div className="h-5 w-24 rounded bg-card mb-4" />
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-card-border" />
            <div className="h-12 flex-1 rounded-xl bg-card" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-12 rounded-xl bg-card" />
      <div className="mt-8 h-12 rounded-xl bg-card" />
    </div>
  );
}
