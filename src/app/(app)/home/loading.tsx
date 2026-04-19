export default function HomeLoading() {
  return (
    <div className="flex flex-col items-center px-6 pt-12 animate-pulse">
      <div className="h-8 w-20 rounded-lg bg-card mb-1" />
      <div className="h-4 w-32 rounded bg-card mb-8" />

      <div className="grid grid-cols-2 gap-6 mb-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-[140px] w-[140px] rounded-full bg-card" />
            <div className="h-3 w-16 rounded bg-card" />
          </div>
        ))}
      </div>

      <div className="h-12 w-full max-w-xs rounded-xl bg-card" />
    </div>
  );
}
