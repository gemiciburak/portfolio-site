"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        <p className="text-accent font-mono text-sm mb-4 tracking-widest uppercase">
          Error
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Something <span className="gradient-text">went wrong</span>
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-10">
          The page couldn&apos;t be loaded. This is usually temporary.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
