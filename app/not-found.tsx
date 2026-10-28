import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        <p className="text-accent-light font-mono text-sm mb-4 tracking-widest uppercase">
          404
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Page <span className="gradient-text">not found</span>
        </h1>
        <p className="text-zinc-400 leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-accent-dark hover:bg-accent text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
